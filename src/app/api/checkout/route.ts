import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { initializePayment } from "@/lib/payments";
import { generateReference, calculateDiscount, calculateTax } from "@/lib/utils";
import type { PaymentGateway } from "@/types/database";
import type { PricingTier } from "@/types/database";

function findActiveTier(tiers: PricingTier[], tier_id?: string): PricingTier | undefined {
  if (tier_id) return tiers.find((t) => t.id === tier_id && t.is_active);
  return tiers.find((t) => t.is_active);
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createServerSupabase();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      course_id,
      tier_id,
      payment_gateway,
      billing,
      coupon_code,
    } = body;
    const user_id = user.id;

    if (!course_id || !payment_gateway || !billing?.email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!["paystack", "flutterwave"].includes(payment_gateway)) {
      return NextResponse.json({ success: false, error: "Invalid payment gateway" }, { status: 400 });
    }

    if (!billing.full_name || !billing.phone || !billing.country) {
      return NextResponse.json({ success: false, error: "Missing billing fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price_ngn, price_usd, slug, currency, is_free")
      .eq("id", course_id)
      .single();

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const { data: tiers } = await supabase
      .from("pricing_tiers")
      .select("*")
      .eq("course_id", course_id)
      .eq("is_active", true);

    const selectedTier = tiers?.length ? findActiveTier(tiers, tier_id) : null;
    const basePrice = selectedTier?.price_ngn || course.price_ngn || 0;

    if (basePrice <= 0) {
      return NextResponse.json(
        { success: false, error: "This course is free. Use the free enrollment endpoint." },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (
        coupon &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (coupon.max_uses <= 0 || coupon.current_uses < coupon.max_uses) &&
        (!coupon.course_id || coupon.course_id === course_id) &&
        (coupon.min_purchase <= 0 || basePrice >= coupon.min_purchase)
      ) {
        discountAmount = calculateDiscount(basePrice, coupon.discount_type, coupon.discount_value);
      }
    }

    const subtotal = basePrice - discountAmount;
    const tax = calculateTax(subtotal, billing.country || "NG");
    const grandTotal = subtotal + tax.amount;
    const currency = course.currency || "NGN";

    const reference = generateReference("PAY");

    const transactionPayload = {
      user_id,
      transaction_reference: reference,
      payment_gateway,
      amount: grandTotal,
      currency,
      status: "pending",
      metadata: {
        course_id,
        tier_id: selectedTier?.id || null,
        billing,
        coupon_code,
        discount_amount: discountAmount,
        tax_amount: tax.amount,
      },
    };

    const { error: txError } = await supabase
      .from("transactions")
      .insert(transactionPayload);

    if (txError) {
      if (txError.code === "23505") {
        return NextResponse.json({ success: false, error: "Duplicate transaction" }, { status: 409 });
      }
      console.error("Transaction insert error:", txError);
      return NextResponse.json({ success: false, error: "Failed to create transaction" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const result = await initializePayment(payment_gateway as PaymentGateway, {
      email: billing.email,
      amount: grandTotal,
      currency,
      reference,
      callback_url: `${siteUrl}/academy/payment/processing?reference=${reference}&gateway=${payment_gateway}`,
      metadata: {
        user_id,
        course_id,
        course_name: course.title,
      },
    });

    if (!result.success) {
      await supabase
        .from("transactions")
        .update({ status: "failed", gateway_response: { error: result.error } })
        .eq("transaction_reference", reference);

      return NextResponse.json({
        success: false,
        error: result.error || "Payment initialization failed",
      }, { status: 400 });
    }

    await supabase
      .from("transactions")
      .update({
        gateway_response: result.gateway_response || {},
        status: "processing",
      })
      .eq("transaction_reference", reference);

    return NextResponse.json({
      success: true,
      reference,
      authorization_url: result.authorization_url,
      gateway: payment_gateway,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}