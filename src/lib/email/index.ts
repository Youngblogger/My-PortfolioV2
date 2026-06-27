import nodemailer from "nodemailer";
import { ACADEMY_NAME, ACADEMY_EMAIL } from "@/lib/constants";
import {
  enrollmentConfirmationEmail,
  paymentReceiptEmail,
  invoiceEmail,
} from "./templates";

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = smtpPort === 465;

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured. Email sending disabled.");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.warn("Email not sent: SMTP not configured");
    return { success: false, error: "SMTP not configured" };
  }
  try {
    await transporter.sendMail({
      from: `"${ACADEMY_NAME}" <${process.env.FROM_EMAIL || ACADEMY_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export async function sendEnrollmentConfirmation(data: {
  email: string;
  student_name: string;
  course_name: string;
  enrollment_number: string;
  amount: string;
  dashboard_url: string;
}) {
  return sendEmail({
    to: data.email,
    subject: `Welcome to ${data.course_name}! - ${ACADEMY_NAME}`,
    html: enrollmentConfirmationEmail(data),
  });
}

export async function sendPaymentReceipt(data: {
  email: string;
  student_name: string;
  course_name: string;
  amount: string;
  transaction_reference: string;
  receipt_url: string;
}) {
  return sendEmail({
    to: data.email,
    subject: `Payment Receipt - ${ACADEMY_NAME}`,
    html: paymentReceiptEmail(data),
  });
}

export async function sendInvoice(data: {
  email: string;
  student_name: string;
  invoice_number: string;
  course_name: string;
  amount: string;
  invoice_url: string;
}) {
  return sendEmail({
    to: data.email,
    subject: `Invoice #${data.invoice_number} - ${ACADEMY_NAME}`,
    html: invoiceEmail(data),
  });
}