import "server-only";

import nodemailer from "nodemailer";

type SmtpConfig = ReturnType<typeof import("@/lib/env").getSmtpEnv>;

type EnquiryEmail = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  createdAt: Date;
};

export async function sendEnquiryNotification(
  enquiry: EnquiryEmail,
  smtp: SmtpConfig,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: smtp.requireTLS,
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  await transporter.sendMail({
    from: smtp.from,
    to: smtp.notificationTo,
    replyTo: enquiry.email,
    subject: "New eCore Business website enquiry",
    text: [
      "A new enquiry was submitted on the eCore Business website.",
      "",
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone}`,
      `Company: ${enquiry.company || "Not provided"}`,
      `Service: ${enquiry.service}`,
      `Received: ${enquiry.createdAt.toISOString()}`,
      "",
      "Message:",
      enquiry.message,
    ].join("\n"),
  });
}
