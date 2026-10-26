import "server-only";
import nodemailer from "nodemailer";
import { getSettingGroup } from "@/services/settings.service";

export async function sendMail(message: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const smtp = (await getSettingGroup("smtp", true)) as Record<
    string,
    string | number | boolean
  >;
  if (!smtp.host || !smtp.port || !smtp.fromEmail)
    throw new Error("SMTP is not configured");
  const transporter = nodemailer.createTransport({
    host: String(smtp.host),
    port: Number(smtp.port),
    secure: Boolean(smtp.secure),
    auth: smtp.username
      ? { user: String(smtp.username), pass: String(smtp.password || "") }
      : undefined,
    requireTLS: Boolean(smtp.requireTls),
  });
  return transporter.sendMail({
    from: {
      name: String(smtp.fromName || "IRILLIC"),
      address: String(smtp.fromEmail),
    },
    ...message,
  });
}
