import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/payments";
import { sendEnrollmentConfirmation, sendPaymentReceipt, sendInvoice } from "@/lib/email";
import type { PaymentGateway } from "@/types/database";

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

async function createRecords(
  supabase: any,
  transaction: any,
  course: any,
  verificationResult: any
) {
  const billing = (transaction.metadata?.billing || {}) as Record<string, unknown>;
  const enrollmentNumber = `CMA-${new Date().getFullYear().toString().slice(-2)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const { data: enrollment, error: enrollmentError } = await supabase
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
    if (enrollmentError.code === "23505") {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", transaction.user_id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("transactions")
          .update({ enrollment_id: existing.id })
          .eq("id", transaction.id);

        return { enrollment: existing, invoice: null, receipt: null };
      }
    }
    console.error("Enrollment error:", enrollmentError);
    return null;
  }

  await supabase
    .from("transactions")
    .update({ enrollment_id: enrollment.id, gateway_response: verificationResult.gateway_response })
    .eq("id", transaction.id);

  await supabase
    .from("courses")
    .update({ students_enrolled: (course.students_enrolled || 0) + 1 })
    .eq("id", course.id);

  const couponCode = transaction.metadata?.coupon_code as string | undefined;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode)
      .single();
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ current_uses: (coupon.current_uses || 0) + 1 })
        .eq("id", coupon.id);
    }
  }

  const invoiceNumber = `INV-CMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0")}`;

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      user_id: transaction.user_id,
      enrollment_id: enrollment.id,
      transaction_id: transaction.id,
      course_name: course.title,
      student_name: (billing.full_name as string) || "Student",
      student_email: (billing.email as string) || "",
      payment_gateway: transaction.payment_gateway,
      payment_method: transaction.payment_gateway,
      subtotal: transaction.amount,
      discount_amount: (transaction.metadata?.discount_amount as number) || 0,
      discount_code: couponCode || null,
      tax_amount: (transaction.metadata?.tax_amount as number) || 0,
      tax_rate: 0.075,
      grand_total: transaction.amount,
      currency: transaction.currency,
      status: "completed",
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();

  const receiptNumber = `RCT-CMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0")}`;

  const { data: receipt } = await supabase
    .from("receipts")
    .insert({
      receipt_number: receiptNumber,
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
    })
    .select()
    .single();

  return { enrollment, invoice, receipt };
}

async function sendEmails(transaction: any, enrollment: any, invoice: any, receipt: any, reference: string) {
  const billing = (transaction.metadata?.billing || {}) as Record<string, unknown>;
  const courseName = (transaction.metadata?.course_name as string) || "";
  if (!billing.email) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await Promise.allSettled([
    sendEnrollmentConfirmation({
      email: billing.email as string,
      student_name: (billing.full_name as string) || "Student",
      course_name: courseName,
      enrollment_number: enrollment.enrollment_number,
      amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
      dashboard_url: `${siteUrl}/academy/enrollment/${enrollment.id}`,
    }),
    sendPaymentReceipt({
      email: billing.email as string,
      student_name: (billing.full_name as string) || "Student",
      course_name: courseName,
      amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
      transaction_reference: reference,
      receipt_url: `${siteUrl}/academy/receipt/${receipt?.id || transaction.id}`,
    }),
    ...(invoice
      ? [
          sendInvoice({
            email: billing.email as string,
            student_name: (billing.full_name as string) || "Student",
            invoice_number: invoice.invoice_number,
            course_name: courseName,
            amount: `${transaction.currency === "NGN" ? "NGN" : "$"}${Number(transaction.amount).toLocaleString()}`,
            invoice_url: `${siteUrl}/academy/invoice/${invoice.id}`,
          }),
        ]
      : []),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const gateway = searchParams.get("gateway");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_reference", reference)
      .single();

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === "completed") {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("id", transaction.enrollment_id)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        status: "completed",
        transaction,
        enrollment,
      });
    }

    const verificationResult = await verifyPayment(
      (gateway as PaymentGateway) || transaction.payment_gateway,
      reference
    );

    if (!verificationResult.success || verificationResult.status !== "success") {
      if (verificationResult.status === "failed") {
        await supabase
          .from("transactions")
          .update({ status: "failed", gateway_response: verificationResult.gateway_response })
          .eq("id", transaction.id);

        return NextResponse.json({
          success: false,
          status: "failed",
          error: "Payment verification failed",
        });
      }

      return NextResponse.json({
        success: false,
        status: "pending",
        message: "Payment is still being processed",
      });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", transaction.metadata?.course_id)
      .single();

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    // Atomic claim: only one caller (verify or webhook) can proceed
    const claimed = await claimTransaction(supabase, transaction.id);
    if (!claimed) {
      const { data: alreadyProcessed } = await supabase
        .from("transactions")
        .select("*, enrollments:enrollment_id(*)")
        .eq("id", transaction.id)
        .single();

      return NextResponse.json({
        success: true,
        status: "completed",
        transaction: alreadyProcessed,
        enrollment: alreadyProcessed?.enrollments || null,
      });
    }

    const result = await createRecords(supabase, transaction, course, verificationResult);

    if (!result) {
      return NextResponse.json({ success: false, error: "Failed to create enrollment" }, { status: 500 });
    }

    await sendEmails(transaction, result.enrollment, result.invoice, result.receipt, reference);

    return NextResponse.json({
      success: true,
      status: "completed",
      transaction: { ...transaction, status: "completed" },
      enrollment: result.enrollment,
      invoice: result.invoice,
      receipt: result.receipt,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}