import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

/**
 * A link that routes through Next where it can, and stays an ordinary anchor
 * where it must.
 *
 * Most hrefs on the public site come from the CMS, so a single page's links
 * may mix internal routes, external sites, same-page anchors, `mailto:` and
 * file downloads. Deciding per link at render time means an editor can paste
 * any of those into the panel without choosing the right component for it.
 */
export function SmartLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const routable =
    typeof href === "string" &&
    // A leading slash, but not "//host", which is an external URL.
    href.startsWith("/") &&
    !href.startsWith("//") &&
    // A download is a file, and client navigation would not fetch it.
    rest.download === undefined &&
    rest.target !== "_blank";

  if (!routable)
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );

  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
