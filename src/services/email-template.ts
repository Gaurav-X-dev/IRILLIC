import "server-only";
import { getBranding } from "@/lib/branding";

/**
 * One branded shell for every message the site sends.
 *
 * Previously each route hand-wrote its own `<p>` tags, so a password reset
 * arrived as unstyled text with no sign of who sent it. Mail clients strip
 * <style> blocks and ignore flexbox, so this is a table layout with inline
 * styles only, and the colours come from the site's own palette rather than a
 * second set invented here.
 */

/** The site's palette, matching src/app/site.css. */
const BRAND = {
  blue: "#0091d0",
  blueDark: "#0079ad",
  ink: "#120304",
  muted: "#5b6472",
  faint: "#8b95a3",
  line: "#e3e8ee",
  canvas: "#f4f7fa",
} as const;

/**
 * Mail clients cannot resolve "/images/logo/…", so every asset and link has to
 * carry the host. NEXT_PUBLIC_APP_URL is the configured public address; the
 * request origin is the fallback for a deployment that has not set it.
 */
export function absoluteUrl(path: string, origin?: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_APP_URL || origin || "").replace(
    /\/+$/,
    "",
  );
  if (!base) return "";
  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EmailContent {
  /** Shown above the heading, in small capitals. */
  eyebrow?: string;
  heading: string;
  /** Each becomes its own paragraph. Plain text; it is escaped here. */
  paragraphs: string[];
  button?: { label: string; href: string };
  /** Label/value rows rendered as a details table, for enquiry alerts. */
  details?: { label: string; value: string }[];
  /** Small print above the footer, for example a link expiry. */
  note?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Builds the HTML and the plain-text alternative together, so a client that
 * refuses HTML still receives the same words rather than an empty message.
 */
export async function renderEmail(
  subject: string,
  content: EmailContent,
  origin?: string,
): Promise<RenderedEmail> {
  const branding = await getBranding();
  const siteUrl = absoluteUrl("/", origin);
  const logo = absoluteUrl(branding.logo, origin);
  const year = new Date().getFullYear();

  const paragraphs = content.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:24px;color:${BRAND.muted};">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  const details = content.details?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 20px;border:1px solid ${BRAND.line};border-radius:10px;border-collapse:separate;overflow:hidden;">
${content.details
  .map(
    (row, index) =>
      `<tr style="background:${index % 2 ? "#ffffff" : BRAND.canvas};">
<td style="padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.faint};white-space:nowrap;vertical-align:top;">${escapeHtml(row.label)}</td>
<td style="padding:11px 14px;font-size:14px;line-height:22px;color:${BRAND.ink};">${escapeHtml(row.value)}</td>
</tr>`,
  )
  .join("\n")}
</table>`
    : "";

  const button = content.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px;">
<tr><td style="border-radius:10px;background:${BRAND.blue};">
<a href="${content.button.href}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(content.button.label)}</a>
</td></tr></table>
<p style="margin:0 0 14px;font-size:12px;line-height:20px;color:${BRAND.faint};">If the button does not work, copy this address into your browser:<br /><span style="color:${BRAND.blueDark};word-break:break-all;">${content.button.href}</span></p>`
    : "";

  const note = content.note
    ? `<p style="margin:18px 0 0;padding:12px 14px;border-left:3px solid ${BRAND.blue};background:${BRAND.canvas};border-radius:0 8px 8px 0;font-size:12px;line-height:20px;color:${BRAND.muted};">${escapeHtml(content.note)}</p>`
    : "";

  const logoBlock = logo
    ? `<img src="${logo}" alt="${escapeHtml(branding.siteName)}" width="132" style="display:block;width:132px;max-width:132px;height:auto;border:0;" />`
    : `<span style="font-size:20px;font-weight:700;letter-spacing:.04em;color:${BRAND.ink};">${escapeHtml(branding.siteName)}</span>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.canvas};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.paragraphs[0] ?? subject)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.canvas};">
<tr><td align="center" style="padding:28px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<!-- Masthead -->
<tr><td style="padding:0 0 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
<td align="left">${siteUrl ? `<a href="${siteUrl}" style="text-decoration:none;">${logoBlock}</a>` : logoBlock}</td>
<td align="right" style="font-size:11px;color:${BRAND.faint};">${escapeHtml(branding.tagline)}</td>
</tr></table>
</td></tr>

<!-- Card -->
<tr><td style="background:#ffffff;border:1px solid ${BRAND.line};border-radius:14px;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td style="height:4px;background:${BRAND.blue};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:30px 32px 32px;">
${
  content.eyebrow
    ? `<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${BRAND.blue};">${escapeHtml(content.eyebrow)}</p>`
    : ""
}
<h1 style="margin:0 0 16px;font-size:22px;line-height:30px;font-weight:700;color:${BRAND.ink};">${escapeHtml(content.heading)}</h1>
${paragraphs}
${details}
${button}
${note}
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 8px 0;">
<p style="margin:0 0 6px;font-size:12px;line-height:20px;color:${BRAND.muted};">
<strong style="color:${BRAND.ink};">${escapeHtml(branding.legalName)}</strong><br />
${escapeHtml(branding.brandDescription)}
</p>
<p style="margin:10px 0 0;font-size:11px;line-height:19px;color:${BRAND.faint};">
${siteUrl ? `<a href="${siteUrl}" style="color:${BRAND.blueDark};text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a> &nbsp;·&nbsp; ` : ""}<a href="mailto:${escapeHtml(branding.supportEmail)}" style="color:${BRAND.blueDark};text-decoration:none;">${escapeHtml(branding.supportEmail)}</a>${branding.phone ? ` &nbsp;·&nbsp; ${escapeHtml(branding.phone)}` : ""}
</p>
<p style="margin:10px 0 0;font-size:11px;line-height:19px;color:${BRAND.faint};">
&copy; ${year} ${escapeHtml(branding.legalName)}. This message was sent automatically — please do not reply to it.
</p>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`;

  const text = [
    branding.siteName.toUpperCase(),
    "",
    content.heading,
    "",
    ...content.paragraphs,
    ...(content.details?.length
      ? ["", ...content.details.map((row) => `${row.label}: ${row.value}`)]
      : []),
    ...(content.button
      ? ["", `${content.button.label}: ${content.button.href}`]
      : []),
    ...(content.note ? ["", content.note] : []),
    "",
    "—",
    branding.legalName,
    branding.supportEmail,
    ...(siteUrl ? [siteUrl] : []),
  ].join("\n");

  return { subject, html, text };
}
