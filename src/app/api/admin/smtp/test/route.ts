import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { apiError } from "@/lib/api";
import { sendMail } from "@/services/mail.service";
import { renderEmail } from "@/services/email-template";

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminApi();
    if (auth.response || !auth.session) return auth.response;
    const body = await request.json();
    const to =
      typeof body.to === "string" && body.to.includes("@")
        ? body.to
        : auth.session.email;
    const message = await renderEmail(
      "Email delivery test",
      {
        eyebrow: "SMTP configuration",
        heading: "Email delivery is working",
        paragraphs: [
          "This is a test message from the administration panel.",
          "Because it reached you, enquiry notifications and password recovery emails will be delivered with the current SMTP settings.",
        ],
        note: "Sent from Settings → SMTP configuration → Send test email.",
      },
      new URL(request.url).origin,
    );
    await sendMail({ to, ...message });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Test email could not be sent");
  }
}
