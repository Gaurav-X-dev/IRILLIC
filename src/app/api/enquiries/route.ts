import { NextResponse } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, securityEvents } from "@/db/schema";
import { apiError, clientIp } from "@/lib/api";
import { enquiryInputSchema } from "@/validations/cms.validation";
import { sendMail } from "@/services/mail.service";
import { getSettingGroup } from "@/services/settings.service";

export async function POST(request: Request) {
  const ip = clientIp(request);
  try {
    const recent = await db
      .select({ value: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.event, "enquiry_created"),
          eq(securityEvents.ipAddress, ip),
          gte(securityEvents.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
        ),
      );
    if ((recent[0]?.value ?? 0) >= 5)
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try later." },
        { status: 429 },
      );
    const input = enquiryInputSchema.parse(await request.json());
    if (input.website) return NextResponse.json({ success: true });
    const [created] = await db
      .insert(enquiries)
      .values({
        kind: input.kind,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        organisation: input.organisation,
        subject: input.subject,
        message: input.message,
        metadata: input.metadata,
      })
      .returning({ id: enquiries.id });
    await db.insert(securityEvents).values({
      event: "enquiry_created",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      success: true,
      metadata: { enquiryId: created.id },
    });
    try {
      const [smtp, general] = await Promise.all([
        getSettingGroup("smtp"),
        getSettingGroup("general"),
      ]);
      const recipient = String(
        smtp.notificationEmail || general.supportEmail || "",
      );
      if (recipient)
        await sendMail({
          to: recipient,
          subject: `[IRILLIC] ${input.subject}`,
          text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone || "-"}\nOrganisation: ${input.organisation || "-"}\n\n${input.message}`,
        });
    } catch (mailError) {
      console.error("Enquiry stored but notification email failed", mailError);
    }
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to submit the enquiry");
  }
}
