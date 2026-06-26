import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "uthmanabdulwahab2019@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "project@codemafia.ng";

const services: Record<string, string> = {
  "e-commerce": "E-Commerce Website",
  lms: "LMS / Education Platform",
  "business-website": "Business Website",
  entertainment: "Entertainment Platform",
  saas: "SaaS Platform",
  mvp: "Startup MVP Build",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, budget, project, timeline } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <h2>New Quote Request from CODEMAFIA.NG</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Service</td><td style="padding:8px;border:1px solid #ddd;">${services[service] || service}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Budget</td><td style="padding:8px;border:1px solid #ddd;">${budget}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Timeline</td><td style="padding:8px;border:1px solid #ddd;">${timeline}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Project Details</td><td style="padding:8px;border:1px solid #ddd;">${project}</td></tr>
      </table>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Quote Request from ${name} — ${services[service] || service}`,
      html,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
