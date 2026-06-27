import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { initializePayment } from "@/lib/payments";
import { generateReference } from "@/lib/utils";
import type { PaymentGateway } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const supabaseAuth = await createServerSupabase();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, amount, currency, gateway, metadata, course_id, billing } = body;

    if (!email || !amount || !gateway) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const reference = generateReference("PAY");
    const supabase = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    let courseName = "";
    if (course_id) {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", course_id)
        .single();
      if (course) courseName = course.title;
    }

    const txPayload = {
      user_id: user.id,
      transaction_reference: reference,
      payment_gateway: gateway,
      amount,
      currency: currency || "NGN",
      status: "pending",
      metadata: { course_id, course_name: courseName, billing: billing || {} },
    };

    await supabase.from("transactions").insert(txPayload);

    const result = await initializePayment(gateway as PaymentGateway, {
      email,
      amount,
      currency: currency || "NGN",
      reference,
      callback_url: `${siteUrl}/academy/payment/processing?reference=${reference}&gateway=${gateway}`,
      metadata: { user_id: user.id, course_id, course_name: courseName },
    });

    if (!result.success) {
      await supabase
        .from("transactions")
        .update({ status: "failed", gateway_response: { error: result.error } })
        .eq("transaction_reference", reference);

      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    await supabase
      .from("transactions")
      .update({ status: "processing", gateway_response: result.gateway_response || {} })
      .eq("transaction_reference", reference);

    return NextResponse.json({
      success: true,
      reference,
      authorization_url: result.authorization_url,
    });
  } catch (error) {
    console.error("Payment init error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}