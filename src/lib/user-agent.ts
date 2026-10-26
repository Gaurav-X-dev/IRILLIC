/**
 * A small user-agent reader for the sessions screen.
 *
 * It only needs to answer "which device and browser was this?" for an
 * administrator looking at their own sign-in history, so it recognises the
 * common families and degrades to "Unknown" rather than pulling in a
 * fingerprinting library.
 */

export interface DeviceInfo {
  browser: string;
  os: string;
  type: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
  /** A single line suitable for a table cell. */
  summary: string;
}

const BROWSERS: [RegExp, string][] = [
  [/edg(?:a|ios|e)?\//i, "Edge"],
  [/opr\/|opera/i, "Opera"],
  [/samsungbrowser/i, "Samsung Internet"],
  [/firefox|fxios/i, "Firefox"],
  [/chrome|crios/i, "Chrome"],
  [/safari/i, "Safari"],
  [/postman|curl|wget|python-requests|node-fetch/i, "API client"],
];

const SYSTEMS: [RegExp, string][] = [
  [/windows nt 10|windows nt 11/i, "Windows"],
  [/windows/i, "Windows"],
  [/iphone|ipod/i, "iOS"],
  [/ipad/i, "iPadOS"],
  [/mac os x|macintosh/i, "macOS"],
  [/android/i, "Android"],
  [/cros/i, "ChromeOS"],
  [/linux/i, "Linux"],
];

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent?.trim())
    return {
      browser: "Unknown",
      os: "Unknown",
      type: "Unknown",
      summary: "Unknown device",
    };

  if (/bot|crawler|spider|headless/i.test(userAgent))
    return {
      browser: "Automated",
      os: "Unknown",
      type: "Bot",
      summary: "Automated client",
    };

  const browser =
    BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Unknown";
  const os =
    SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Unknown";
  const type: DeviceInfo["type"] = /ipad|tablet/i.test(userAgent)
    ? "Tablet"
    : /mobi|iphone|android/i.test(userAgent)
      ? "Mobile"
      : "Desktop";

  const summary =
    browser === "Unknown" && os === "Unknown"
      ? "Unknown device"
      : `${browser} on ${os}`;

  return { browser, os, type, summary };
}
