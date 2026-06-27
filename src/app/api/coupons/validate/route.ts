import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, course_id, amount } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      await supabase
        .from("coupons")
        .update({ is_active: false })
        .eq("id", coupon.id);

      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    if (coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    if (coupon.min_purchase > 0 && amount < coupon.min_purchase) {
      return NextResponse.json({
        valid: false,
        error: `Minimum purchase of ${coupon.min_purchase.toLocaleString()} required`,
      });
    }

    if (coupon.course_id && coupon.course_id !== course_id) {
      return NextResponse.json({ valid: false, error: "This coupon is not valid for this course" });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
