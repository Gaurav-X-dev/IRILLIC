import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { clientIp, databaseErrorCode, zodMessage } from "../../src/lib/api";
import { isSafePublicUrl } from "../../src/lib/safe-url";
import { hasExpectedFileSignature } from "../../src/lib/file-signature";
import {
  assemblePageContent,
  assertSafeSectionData,
} from "../../src/lib/page-sections";
import {
  contentInputSchema,
  contentUpdateSchema,
  enquiryInputSchema,
} from "../../src/validations/cms.validation";
import { validateKnownCmsContent } from "../../src/validations/public-content.validation";
import {
  SettingValidationError,
  phoneSchema,
  validateSettingValues,
} from "../../src/validations/setting.validation";
import { uploadLimitMb } from "../../src/lib/upload-limits";

test("public URLs reject executable and protocol-relative values", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,x",
    "//attacker.example",
    "",
    "https://ok.example\nscript",
  ])
    assert.equal(isSafePublicUrl(value), false, value);
  for (const value of [
    "/contact",
    "#form",
    "https://irillic.com/page",
    "mailto:info@irillic.com",
    "tel:+911234567890",
  ])
    assert.equal(isSafePublicUrl(value), true, value);
});

test("client IP accepts only real IPv4/IPv6 and cannot overflow database fields", () => {
  assert.equal(
    clientIp(
      new Request("http://test", {
        headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
      }),
    ),
    "203.0.113.7",
  );
  assert.equal(
    clientIp(
      new Request("http://test", {
        headers: { "x-forwarded-for": "not-an-ip" },
      }),
    ),
    "unknown",
  );
  assert.equal(
    clientIp(
      new Request("http://test", {
        headers: { "x-forwarded-for": "x".repeat(500) },
      }),
    ),
    "unknown",
  );
});

test("database errors are recognized through wrapped causes", () => {
  assert.equal(
    databaseErrorCode({ cause: { cause: { code: "23505" } } }),
    "23505",
  );
  assert.equal(databaseErrorCode({ cause: null }), null);
});

test("document uploads must match their declared file type", () => {
  assert.equal(
    hasExpectedFileSignature("application/pdf", Buffer.from("%PDF-1.7")),
    true,
  );
  assert.equal(
    hasExpectedFileSignature("application/pdf", Buffer.from("<script>")),
    false,
  );
  assert.equal(
    hasExpectedFileSignature(
      "video/mp4",
      Buffer.from([0, 0, 0, 20, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 0]),
    ),
    true,
  );
  assert.equal(
    hasExpectedFileSignature("video/mp4", Buffer.from("not-video")),
    false,
  );
});

test("page sections assemble in order and omit disabled sections", () => {
  const content = assemblePageContent([
    { sectionKey: "second", data: { value: 2 }, isEnabled: true, sortOrder: 2 },
    {
      sectionKey: "hidden",
      data: { value: 0 },
      isEnabled: false,
      sortOrder: 0,
    },
    { sectionKey: "first", data: { value: 1 }, isEnabled: true, sortOrder: 1 },
  ]);
  assert.deepEqual(content, { first: { value: 1 }, second: { value: 2 } });
  assert.deepEqual(
    assemblePageContent([
      {
        sectionKey: "sections__hero",
        data: { title: "Hero" },
        isEnabled: true,
        sortOrder: 0,
      },
    ]),
    { sections: { hero: { title: "Hero" } } },
  );
});

test("page section data rejects prototype keys, excessive depth and size", () => {
  const unsafe = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => assertSafeSectionData(unsafe));
  let deep: unknown = "value";
  for (let index = 0; index < 14; index += 1) deep = { child: deep };
  assert.throws(() => assertSafeSectionData(deep));
  assert.throws(() => assertSafeSectionData({ text: "x".repeat(250_001) }));
});

test("CMS input normalizes values and rejects unknown fields", () => {
  const parsed = contentInputSchema.parse({
    type: "resource",
    slug: "  test-resource ",
    title: " Test resource ",
    content: {},
    unexpected: "drop me",
  });
  assert.equal(parsed.slug, "test-resource");
  assert.equal("unexpected" in parsed, false);
  assert.throws(() =>
    contentInputSchema.parse({
      type: "invalid",
      slug: "x",
      title: "Valid title",
    }),
  );
  assert.throws(() =>
    contentInputSchema.parse({
      type: "resource",
      slug: "../escape",
      title: "Valid title",
    }),
  );
});

test("partial CMS updates do not inject create defaults", () => {
  assert.deepEqual(contentUpdateSchema.parse({ title: "Updated title" }), {
    title: "Updated title",
  });
});

test("enquiries enforce bounds, honeypot and valid email", () => {
  const valid = {
    name: "Test User",
    email: "test@example.com",
    subject: "Testing",
    message: "A sufficiently long message.",
  };
  assert.doesNotThrow(() => enquiryInputSchema.parse(valid));
  assert.throws(() => enquiryInputSchema.parse({ ...valid, email: "bad" }));
  assert.throws(() => enquiryInputSchema.parse({ ...valid, message: "short" }));
  assert.equal(
    enquiryInputSchema.parse({ ...valid, website: "bot-value" }).website,
    "bot-value",
  );
});

test("known page content is structurally validated", () => {
  assert.throws(() => validateKnownCmsContent("page", "home", {}));
  assert.doesNotThrow(() =>
    validateKnownCmsContent("resource", "custom", { arbitrary: true }),
  );
});

test("a contact phone must be +91 followed by ten mobile digits", () => {
  const accepted = ["", "+91 76520 68867", "+917652068867", "+91-98765-43210"];
  for (const value of accepted)
    assert.equal(
      phoneSchema.safeParse(value).success,
      true,
      `${value || "(empty)"} should be accepted`,
    );

  const rejected: [string, RegExp][] = [
    ["7652068867", /\+91 country code/],
    ["+91 7652 0688", /exactly 10 digits/],
    ["+91 76520 688671", /exactly 10 digits/],
    ["+91 56520 68867", /starts with 6, 7, 8 or 9/],
  ];
  for (const [value, expected] of rejected) {
    const result = phoneSchema.safeParse(value);
    assert.equal(result.success, false, `${value} should be rejected`);
    assert.match(result.error!.issues[0].message, expected);
  }
});

test("a setting is rejected with the field it belongs to", () => {
  assert.throws(
    () => validateSettingValues("general", { supportEmail: "not-an-email" }),
    (error: unknown) => {
      assert.ok(error instanceof SettingValidationError);
      // The panel marks the box with `field` and prints `reason` beneath it,
      // so an editor is taken to the problem rather than reading a banner.
      assert.equal(error.field, "supportEmail");
      assert.equal(error.reason, "Enter a valid email address");
      assert.equal(error.message, "Support email: Enter a valid email address");
      return true;
    },
  );
});

test("an upload limit is raised for video only", () => {
  assert.equal(uploadLimitMb("video/mp4"), 20);
  assert.equal(uploadLimitMb("image/png"), 10);
  assert.equal(uploadLimitMb("application/pdf"), 10);
});

test("a validation message names the field, the item and every problem", () => {
  const schema = z.object({
    divisions: z.array(z.object({ title: z.string(), href: z.string() })),
  });
  const missing = schema.safeParse({});
  assert.equal(missing.success, false);
  // The toggle that hid a required section reported "Divisions: expected
  // array", which read as though the content were wrong rather than absent.
  assert.equal(
    zodMessage(missing.error!),
    "Divisions: this is required and is currently empty.",
  );

  const wrong = schema.safeParse({
    divisions: [
      { title: "One", href: "/one" },
      { title: 7, href: null },
    ],
  });
  assert.equal(wrong.success, false);
  const message = zodMessage(wrong.error!);
  // The index is what tells an editor which of the repeated cards to open.
  assert.match(message, /Divisions, item 2 › Title/);
  assert.match(message, /Divisions, item 2 › Href/);
});
