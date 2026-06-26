import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "uthmanabdulwahab2019@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "admin@codemafia.ng";

export async function POST(req: NextRequest) {
  try {
    const { name, email, level, goals, startDate, paymentPlan, cohort, stack } = await req.json();

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
      <h2>New Enrollment — ${stack}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Stack</td><td style="padding:8px;border:1px solid #ddd;">${stack}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Skill Level</td><td style="padding:8px;border:1px solid #ddd;">${level}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Goals</td><td style="padding:8px;border:1px solid #ddd;">${goals}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Start Date</td><td style="padding:8px;border:1px solid #ddd;">${startDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Payment Plan</td><td style="padding:8px;border:1px solid #ddd;">${paymentPlan}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Cohort</td><td style="padding:8px;border:1px solid #ddd;">${cohort}</td></tr>
      </table>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `New Enrollment: ${name} — ${stack}`,
      html,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enroll email error:", err);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
