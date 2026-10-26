import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { hasPermission, type AdminPermission } from "@/lib/rbac";

export async function authorizeAdminApi(
  options: {
    allowPasswordChange?: boolean;
    permission?: AdminPermission;
  } = {},
) {
  const session = await getAdminSession();
  if (!session)
    return {
      session: null,
      response: NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 },
      ),
    };
  if (session.mustChangePassword && !options.allowPasswordChange)
    return {
      session,
      response: NextResponse.json(
        {
          success: false,
          error: "Password change required",
          code: "PASSWORD_CHANGE_REQUIRED",
        },
        { status: 403 },
      ),
    };
  const permission = options.permission ?? "settings:manage";
  if (!hasPermission(session.role, permission))
    return {
      session,
      response: NextResponse.json(
        {
          success: false,
          error: "You do not have permission to perform this action.",
          code: "FORBIDDEN",
        },
        { status: 403 },
      ),
    };
  return { session, response: null };
}
