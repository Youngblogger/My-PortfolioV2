import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { sendEnrollmentConfirmation, sendPaymentReceipt, sendInvoice } from "@/lib/email";
import crypto from "crypto";

function verifyPaystackSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

function verifyFlutterwaveSignature(body: string, expectedHash: string): boolean {
  if (!expectedHash) return false;
  const hash = crypto.createHash("sha256").update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

async function claimTransaction(supabase: any, transactionId: string) {
  const { data: claimed } = await supabase
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", transactionId)
    .in("status", ["pending", "processing"])
    .select()
    .single();

  return claimed;
}

async function processPayment(transaction: any, body: Record<string, unknown>, supabase: any) {
  const billing = (transaction.metadata?.billing || {}) as Record<string, unknown>;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", transaction.metadata?.course_id)
    .maybeSingle();

  if (!course) return;

  const claimed = await claimTransaction(supabase, transaction.id);
  if (!claimed) return;

  const enrollmentNumber = `CMA-${new Date().getFullYear().toString().slice(-2)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  let { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .insert({
      user_id: transaction.user_id,
      course_id: course.id,
      tier_id: transaction.metadata?.tier_id || null,
      enrollment_number: enrollmentNumber,
      status: "active",
      metadata: transaction.metadata || {},
    })
    .select()
    .single();

  if (enrollmentError) {
    if (enrollmentError.code !== "23505") return;
    const { data: existing } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", transaction.user_id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (!existing) return;
    enrollment = existing;
  }

  if (!enrollment) return;

  await supabase
    .from("transactions")
    .update({ enrollment_id: enrollment.id, gateway_response: body })
    .eq("id", transaction.id);

  await supabase
    .from("courses")
    .update({ students_enrolled: (course.students_enrolled || 0) + 1 })
    .eq("id", course.id);

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      invoice_number: `INV-CMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0")}`,
      user_id: transaction.user_id,
      enrollment_id: enrollment.id,
      transaction_id: transaction.id,
      course_name: course.title,
      student_name: (billing.full_name as string) || "Student",
      student_email: (billing.email as string) || "",
      payment_gateway: transaction.payment_gateway,
      payment_method: transaction.payment_gateway,
      subtotal: transaction.amount,
      grand_total: transaction.amount,
      currency: transaction.currency,
      status: "completed",
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();

  await supabase
    .from("receipts")
    .insert({
      receipt_number: `RCT-CMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0")}`,
      transaction_reference: transaction.transaction_reference,
      user_id: transaction.user_id,
      enrollment_id: enrollment.id,
      invoice_id: invoice?.id || null,
      course_name: course.title,
      student_name: (billing.full_name as string) || "Student",
      amount: transaction.amount,
      payment_gateway: transaction.payment_gateway,
      payment_method: transaction.payment_gateway,
      currency: transaction.currency,
      status: "completed",
    });

  if (billing.email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await Promise.allSettled([
      sendEnrollmentConfirmation({
        email: billing.email as string,
        student_name: (billing.full_name as string) || "Student",
        course_name: course.title,
        enrollment_number: enrollmentNumber,
        amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
        dashboard_url: `${siteUrl}/academy/enrollment/${enrollment.id}`,
      }),
      sendPaymentReceipt({
        email: billing.email as string,
        student_name: (billing.full_name as string) || "Student",
        course_name: course.title,
        amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
        transaction_reference: transaction.transaction_reference,
        receipt_url: `${siteUrl}/academy/receipt/${transaction.id}`,
      }),
      ...(invoice
        ? [
            sendInvoice({
              email: billing.email as string,
              student_name: (billing.full_name as string) || "Student",
              invoice_number: invoice.invoice_number,
              course_name: course.title,
              amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
              invoice_url: `${siteUrl}/academy/invoice/${invoice.id}`,
            }),
          ]
        : []),
    ]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const gateway = request.nextUrl.searchParams.get("gateway") || "paystack";

    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    if (gateway === "paystack") {
      const signature = headers["x-paystack-signature"];
      const secret = process.env.PAYSTACK_SECRET_KEY || "";
      if (!verifyPaystackSignature(rawBody, signature, secret)) {
        return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 401 });
      }
    } else if (gateway === "flutterwave") {
      const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || "";
      if (!verifyFlutterwaveSignature(rawBody, secretHash)) {
        return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const provider = getPaymentProvider(gateway as "paystack" | "flutterwave");
    const webhookResult = await provider.webhook(body);

    if (!webhookResult.success || !webhookResult.reference) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_reference", webhookResult.reference)
      .maybeSingle();

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    if (webhookResult.status === "success") {
      await processPayment(transaction, body, supabase);
    } else {
      await supabase
        .from("transactions")
        .update({ status: "failed", gateway_response: webhookResult.gateway_response })
        .eq("id", transaction.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}