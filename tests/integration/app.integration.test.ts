import assert from "node:assert/strict";
import test, { after } from "node:test";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const email = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD;
let cookie = "";
let temporaryId = "";

async function json(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("x-forwarded-for", "198.51.100.23");
  if (cookie) headers.set("cookie", cookie);
  return fetch(`${base}${path}`, { ...init, headers, redirect: "manual" });
}

test("health reports a connected database", async () => {
  const response = await fetch(`${base}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "healthy");
  assert.equal(body.database.connected, true);
});

test("all public routes render with security headers", async () => {
  for (const path of [
    "/",
    "/about-us",
    "/products",
    "/products/irillic-l-nm",
    "/clinical-applications",
    "/clinical-resources",
    "/contact",
    "/login",
  ]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    assert.equal(
      response.headers.get("x-content-type-options"),
      "nosniff",
      path,
    );
    assert.equal(response.headers.get("x-frame-options"), "DENY", path);
    assert.match(
      response.headers.get("content-security-policy") ?? "",
      /frame-ancestors 'none'/,
      path,
    );
  }
});

test("public health endpoint remains stable under concurrent requests", async () => {
  const responses = await Promise.all(
    Array.from({ length: 40 }, () => fetch(`${base}/api/health`)),
  );
  assert.equal(
    responses.every((response) => response.status === 200),
    true,
  );
  const payloads = await Promise.all(
    responses.map((response) => response.json()),
  );
  assert.equal(
    payloads.every((body) => body.database?.connected === true),
    true,
  );
});

test("protected endpoints reject anonymous requests", async () => {
  const response = await json("/api/admin/content?type=page");
  assert.equal(response.status, 401);
});

test("login rejects malformed payload without leaking internals", async () => {
  const response = await json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "bad", password: "" }),
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(JSON.stringify(body).includes("stack"), false);
});

test("password recovery does not reveal whether an account exists", async () => {
  const known = await json("/api/auth/forgot-password", {
    method: "POST",
    headers: { "x-forwarded-for": "198.51.100.31" },
    body: JSON.stringify({ email: email ?? "admin@irillic.com" }),
  });
  const unknown = await json("/api/auth/forgot-password", {
    method: "POST",
    headers: { "x-forwarded-for": "198.51.100.32" },
    body: JSON.stringify({ email: "missing@example.test" }),
  });
  assert.equal(known.status, 200);
  assert.equal(unknown.status, 200);
  assert.deepEqual(await known.json(), await unknown.json());
});

test(
  "administrator can authenticate",
  { skip: !email || !password },
  async () => {
    const response = await json("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember: false }),
    });
    assert.equal(response.status, 200, await response.text());
    cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";
    assert.match(cookie, /^irillic_admin_session=/);
  },
);

test(
  "invalid CMS filters are rejected",
  { skip: !email || !password },
  async () => {
    const response = await json("/api/admin/content?type=../../etc");
    assert.equal(response.status, 400);
  },
);

test(
  "CMS resource create, read, update and delete cycle",
  { skip: !email || !password },
  async () => {
    const existing = await json("/api/admin/content?type=resource");
    const existingBody = await existing.json();
    for (const row of existingBody.data ?? [])
      if (String(row.slug).startsWith("integration-"))
        await json(`/api/admin/content/${row.id}`, { method: "DELETE" });
    const slug = `integration-${Date.now()}`;
    const create = await json("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({
        type: "resource",
        slug,
        title: "Integration resource",
        summary: "Temporary test record",
        status: "draft",
        content: { resourceType: "Study", href: "/test.pdf" },
        seo: {},
        sortOrder: 999,
        isFeatured: false,
      }),
    });
    const createText = await create.text();
    assert.equal(create.status, 201, createText);
    const created = JSON.parse(createText);
    temporaryId = created.data.id;
    const duplicate = await json("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({
        type: "resource",
        slug,
        title: "Duplicate resource",
        content: {},
      }),
    });
    assert.equal(duplicate.status, 409);
    const update = await json(`/api/admin/content/${temporaryId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated integration resource" }),
    });
    assert.equal(update.status, 200, await update.text());
    const remove = await json(`/api/admin/content/${temporaryId}`, {
      method: "DELETE",
    });
    assert.equal(remove.status, 200, await remove.text());
    temporaryId = "";
  },
);

test(
  "concurrent duplicate writes are conflict-safe",
  { skip: !email || !password },
  async () => {
    const slug = `race-${Date.now()}`;
    const payload = JSON.stringify({
      type: "resource",
      slug,
      title: "Concurrent test record",
      content: {},
      status: "draft",
    });
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        json("/api/admin/content", { method: "POST", body: payload }),
      ),
    );
    assert.equal(
      responses.filter((response) => response.status === 201).length,
      1,
    );
    assert.equal(
      responses.filter((response) => response.status === 409).length,
      4,
    );
    const list = await json("/api/admin/content?type=resource");
    const row = (await list.json()).data.find(
      (item: { slug: string }) => item.slug === slug,
    );
    assert.ok(row);
    assert.equal(
      (await json(`/api/admin/content/${row.id}`, { method: "DELETE" })).status,
      200,
    );
  },
);

test(
  "known structured content rejects executable URLs",
  { skip: !email || !password },
  async () => {
    const response = await json("/api/admin/content", {
      method: "POST",
      body: JSON.stringify({
        type: "product",
        slug: `unsafe-${Date.now()}`,
        title: "Unsafe product",
        content: {
          anchor: "x",
          approach: "x",
          image: "/x",
          imageAlt: "x",
          chips: [],
          features: [],
          primary: { label: "Bad", href: "javascript:alert(1)" },
          secondary: { label: "Bad", href: "/", icon: "arrow" },
        },
      }),
    });
    assert.equal(response.status, 400);
  },
);

test(
  "media endpoint rejects spoofed and corrupt file content",
  { skip: !email || !password },
  async () => {
    for (const [name, type, bytes] of [
      ["fake.png", "image/png", "not an image"],
      ["fake.pdf", "application/pdf", "<script>alert(1)</script>"],
    ] as const) {
      const form = new FormData();
      form.set("file", new File([bytes], name, { type }));
      const response = await fetch(`${base}/api/admin/media`, {
        method: "POST",
        headers: { cookie, "x-forwarded-for": "198.51.100.23" },
        body: form,
      });
      assert.equal(response.status, 400, `${name}: ${await response.text()}`);
    }
  },
);

test(
  "required public pages cannot be unpublished or deleted",
  { skip: !email || !password },
  async () => {
    const list = await json("/api/admin/content?type=page");
    const body = await list.json();
    const core = body.data.find(
      (row: { slug: string }) => row.slug === "clinical-resources",
    );
    assert.ok(core);
    const unpublish = await json(`/api/admin/content/${core.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "draft" }),
    });
    assert.equal(unpublish.status, 409);
    const remove = await json(`/api/admin/content/${core.id}`, {
      method: "DELETE",
    });
    assert.equal(remove.status, 409);
  },
);

test(
  "section editor changes render on the public website and restore cleanly",
  { skip: !email || !password },
  async () => {
    const list = await json("/api/admin/content?type=page");
    const page = (await list.json()).data.find(
      (row: { slug: string }) => row.slug === "clinical-resources",
    );
    assert.ok(page);
    const sectionsResponse = await json(`/api/admin/pages/${page.id}/sections`);
    assert.equal(sectionsResponse.status, 200);
    const section = (await sectionsResponse.json()).data.find(
      (row: { sectionKey: string }) => row.sectionKey === "sectionTitle",
    );
    assert.ok(section);
    const marker = `Dynamic Resource Library ${Date.now()}`;
    try {
      const update = await json(`/api/admin/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: marker }),
      });
      assert.equal(update.status, 200, await update.text());
      const publicPage = await fetch(`${base}/clinical-resources`);
      assert.match(await publicPage.text(), new RegExp(marker));
    } finally {
      const restore = await json(`/api/admin/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: section.data }),
      });
      assert.equal(restore.status, 200);
    }
  },
);

test(
  "home page section fields update independently",
  { skip: !email || !password },
  async () => {
    const pages = await json("/api/admin/content?type=page");
    const home = (await pages.json()).data.find(
      (row: { slug: string }) => row.slug === "home",
    );
    const sections = await json(`/api/admin/pages/${home.id}/sections`);
    const form = (await sections.json()).data.find(
      (row: { sectionKey: string }) => row.sectionKey === "contactForm",
    );
    assert.ok(form);
    const marker = `Send test enquiry ${Date.now()}`;
    try {
      const update = await json(`/api/admin/sections/${form.id}`, {
        method: "PATCH",
        body: JSON.stringify({ data: { ...form.data, submitLabel: marker } }),
      });
      assert.equal(update.status, 200, await update.text());
      assert.match(await (await fetch(`${base}/`)).text(), new RegExp(marker));
    } finally {
      assert.equal(
        (
          await json(`/api/admin/sections/${form.id}`, {
            method: "PATCH",
            body: JSON.stringify({ data: form.data }),
          })
        ).status,
        200,
      );
    }
  },
);

test(
  "custom page sections support create, edit, reorder and delete",
  { skip: !email || !password },
  async () => {
    const pages = await json("/api/admin/content?type=page");
    const home = (await pages.json()).data.find(
      (row: { slug: string }) => row.slug === "home",
    );
    const key = `test-section-${Date.now()}`;
    const create = await json(`/api/admin/pages/${home.id}/sections`, {
      method: "POST",
      body: JSON.stringify({
        sectionKey: key,
        label: "Test section",
        data: { heading: "Initial", body: "Test body" },
      }),
    });
    const createText = await create.text();
    assert.equal(create.status, 201, createText);
    const section = JSON.parse(createText);
    const update = await json(`/api/admin/sections/${section.data.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        label: "Updated test section",
        data: { heading: "Updated", body: "Changed" },
        sortOrder: 999,
      }),
    });
    assert.equal(update.status, 200, await update.text());
    assert.equal(
      (
        await json(`/api/admin/sections/${section.data.id}`, {
          method: "DELETE",
        })
      ).status,
      200,
    );
  },
);

test(
  "required design sections cannot be disabled or deleted",
  { skip: !email || !password },
  async () => {
    const pages = await json("/api/admin/content?type=page");
    const home = (await pages.json()).data.find(
      (row: { slug: string }) => row.slug === "home",
    );
    const sections = await json(`/api/admin/pages/${home.id}/sections`);
    const slides = (await sections.json()).data.find(
      (row: { sectionKey: string }) => row.sectionKey === "slides",
    );
    assert.equal(
      (
        await json(`/api/admin/sections/${slides.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isEnabled: false }),
        })
      ).status,
      400,
    );
    assert.equal(
      (await json(`/api/admin/sections/${slides.id}`, { method: "DELETE" }))
        .status,
      409,
    );
  },
);

test(
  "invalid identifiers and malformed enquiry bodies are safe client errors",
  { skip: !email || !password },
  async () => {
    const invalidId = await json("/api/admin/content/not-a-uuid", {
      method: "PATCH",
      body: JSON.stringify({ title: "Still valid" }),
    });
    assert.equal(invalidId.status, 400);
    const enquiry = await json("/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "x",
        email: "no",
        subject: "x",
        message: "tiny",
      }),
    });
    assert.equal(enquiry.status, 400);
    const honeypot = await json("/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Bot User",
        email: "bot@example.test",
        subject: "Bot subject",
        message: "This looks valid but is spam.",
        website: "https://spam.test",
      }),
    });
    assert.equal(honeypot.status, 200);
  },
);

after(async () => {
  if (temporaryId && cookie)
    await json(`/api/admin/content/${temporaryId}`, { method: "DELETE" });
});
