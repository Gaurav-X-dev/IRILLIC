import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { SmartLink } from "../../src/components/shared/smart-link";

/**
 * Public-site hrefs come from the CMS, so one page mixes internal routes with
 * external sites, same-page anchors, mailto: and downloads. Only the first
 * kind may be routed through Next; the rest have to stay ordinary anchors or
 * they stop working.
 */
function render(props: Record<string, unknown>) {
  return renderToStaticMarkup(
    createElement(SmartLink, props as never, "label"),
  );
}

test("internal routes render an anchor pointing at the route", () => {
  for (const href of ["/products", "/about-us", "/products/irillic-l-nm"])
    assert.match(render({ href }), new RegExp(`href="${href}"`));
});

test("links that must not be routed keep their href untouched", () => {
  const cases = [
    { href: "https://motherson.com" },
    { href: "//cdn.example.com/x" },
    { href: "mailto:info@irillic.com" },
    { href: "tel:+917652068867" },
    { href: "#contact" },
    { href: "/brochure.pdf", download: true },
    { href: "/careers", target: "_blank" },
  ];
  for (const props of cases) {
    const html = render(props);
    assert.ok(
      html.startsWith("<a "),
      `${props.href} should stay a plain anchor, got: ${html}`,
    );
    assert.ok(html.includes(`href="${props.href}"`), html);
  }
});

test("attributes survive the decision either way", () => {
  const internal = render({ href: "/products", className: "pill", id: "p" });
  assert.match(internal, /class="pill"/);
  assert.match(internal, /id="p"/);
  const external = render({
    href: "https://example.com",
    className: "pill",
    rel: "noopener",
  });
  assert.match(external, /class="pill"/);
  assert.match(external, /rel="noopener"/);
});

test("a missing href does not throw", () => {
  assert.doesNotThrow(() => render({}));
});
