import assert from "node:assert/strict";
import test from "node:test";
import { clientIp, databaseErrorCode } from "../../src/lib/api";
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
