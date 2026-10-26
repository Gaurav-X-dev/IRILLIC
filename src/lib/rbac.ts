export const ADMIN_ROLES = ["admin", "content_reader"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "dashboard:view"
  | "content:read"
  | "content:write"
  | "media:read"
  | "media:write"
  | "enquiries:manage"
  | "settings:manage"
  | "users:manage"
  | "profile:manage";

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  admin: [
    "dashboard:view",
    "content:read",
    "content:write",
    "media:read",
    "media:write",
    "enquiries:manage",
    "settings:manage",
    "users:manage",
    "profile:manage",
  ],
  content_reader: [
    "dashboard:view",
    "content:read",
    "media:read",
    "profile:manage",
  ],
};

export const ROLE_DETAILS: Record<
  AdminRole,
  { label: string; description: string }
> = {
  admin: {
    label: "Administrator",
    description: "Full control over content, users, settings and security.",
  },
  content_reader: {
    label: "Content Reader",
    description:
      "Can sign in and view website content and media, but cannot change or delete anything.",
  },
};

export function isAdminRole(value: string): value is AdminRole {
  return ADMIN_ROLES.includes(value as AdminRole);
}

export function hasPermission(
  role: string,
  permission: AdminPermission,
): boolean {
  return isAdminRole(role) && ROLE_PERMISSIONS[role].includes(permission);
}
