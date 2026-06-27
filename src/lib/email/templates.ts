import { escapeHtml, sanitizeUrl } from "@/lib/utils";

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, Helvetica, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 40px; border: 1px solid #1a1a2e;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #d4af37; font-size: 24px; margin: 0;">CODEMAFIA Academy</h1>
    </div>
    <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 8px;">${title}</h2>
    ${body}
    <p style="color: #52525b; font-size: 12px; margin-top: 24px; text-align: center;">
      CODEMAFIA Academy &mdash; Lagos, Nigeria
    </p>
  </div>
</body>
</html>`;
}

export function enrollmentConfirmationEmail(data: {
  student_name: string;
  course_name: string;
  enrollment_number: string;
  amount: string;
  dashboard_url: string;
}) {
  const name = escapeHtml(data.student_name);
  const course = escapeHtml(data.course_name);
  const number = escapeHtml(data.enrollment_number);
  const amount = data.amount ? escapeHtml(data.amount) : "";
  const url = sanitizeUrl(data.dashboard_url);

  const body = `
    <p style="color: #a1a1aa; margin: 0 0 24px; line-height: 1.6;">
      Welcome, ${name}! You are now enrolled in <strong style="color: #d4af37;">${course}</strong>.
    </p>
    <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Enrollment Number</p>
      <p style="margin: 0; color: #d4af37; font-size: 18px; font-weight: bold;">${number}</p>
      ${amount ? `<p style="margin: 16px 0 0; color: #a1a1aa; font-size: 14px;">Amount Paid</p><p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${amount}</p>` : ""}
    </div>
    ${url ? `<a href="${url}" style="display: block; text-align: center; background: #d4af37; color: #0a0a0a; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; font-size: 16px;">Start Learning</a>` : ""}`;

  return baseTemplate("Welcome to CODEMAFIA Academy!", body);
}

export function paymentReceiptEmail(data: {
  student_name: string;
  course_name: string;
  amount: string;
  transaction_reference: string;
  receipt_url: string;
}) {
  const name = escapeHtml(data.student_name);
  const course = escapeHtml(data.course_name);
  const amount = escapeHtml(data.amount);
  const ref = escapeHtml(data.transaction_reference);
  const url = sanitizeUrl(data.receipt_url);

  const body = `
    <p style="color: #a1a1aa; margin: 0 0 24px; line-height: 1.6;">Thank you, ${name}!</p>
    <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Course</p>
      <p style="margin: 0 0 16px; color: #ffffff; font-size: 16px;">${course}</p>
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Amount Paid</p>
      <p style="margin: 0 0 16px; color: #d4af37; font-size: 18px; font-weight: bold;">${amount}</p>
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Reference</p>
      <p style="margin: 0; color: #a1a1aa; font-size: 14px;">${ref}</p>
    </div>
    ${url ? `<a href="${url}" style="display: block; text-align: center; background: #d4af37; color: #0a0a0a; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; font-size: 16px;">View Receipt</a>` : ""}`;

  return baseTemplate("Payment Receipt", body);
}

export function invoiceEmail(data: {
  student_name: string;
  invoice_number: string;
  course_name: string;
  amount: string;
  invoice_url: string;
}) {
  const name = escapeHtml(data.student_name);
  const inv = escapeHtml(data.invoice_number);
  const course = escapeHtml(data.course_name);
  const amount = escapeHtml(data.amount);
  const url = sanitizeUrl(data.invoice_url);

  const body = `
    <p style="color: #a1a1aa; margin: 0 0 24px;">Dear ${name},</p>
    <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Course</p>
      <p style="margin: 0 0 16px; color: #ffffff; font-size: 16px;">${course}</p>
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Invoice Number</p>
      <p style="margin: 0 0 16px; color: #ffffff; font-size: 16px;">${inv}</p>
      <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 14px;">Total</p>
      <p style="margin: 0; color: #d4af37; font-size: 18px; font-weight: bold;">${amount}</p>
    </div>
    ${url ? `<a href="${url}" style="display: block; text-align: center; background: #d4af37; color: #0a0a0a; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; font-size: 16px;">View Invoice</a>` : ""}`;

  return baseTemplate(`Invoice #${inv}`, body);
}