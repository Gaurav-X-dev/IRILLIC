import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { sendMail } from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const body = await request.json();
    const to =
      typeof body.to === "string" && body.to.includes("@")
        ? body.to
        : auth.session.email;
    await sendMail({
      to,
      subject: "IRILLIC SMTP test",
      text: "Your IRILLIC administration portal email configuration is working.",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Test email could not be sent");
  }
}
