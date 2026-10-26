/**
 * Shared admin theme contract. It lives outside the client component so the
 * dashboard layout (a server component) can read the cookie without pulling a
 * client module into the server graph.
 */
export type AdminTheme = "light" | "dark" | "system";

/**
 * The preference lives in a cookie rather than localStorage so the server can
 * render the correct theme on the first paint — no flash of the light panel.
 */
export const ADMIN_THEME_COOKIE = "irillic_admin_theme";

export function isAdminTheme(value: unknown): value is AdminTheme {
  return value === "light" || value === "dark" || value === "system";
}
