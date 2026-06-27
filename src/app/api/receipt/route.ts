import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing receipt ID" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: receipt } = await adminClient
      .from("receipts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!receipt) {
      const { data: byTransaction } = await adminClient
        .from("receipts")
        .select("*")
        .eq("transaction_reference", id)
        .maybeSingle();

      if (!byTransaction) {
        return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
      }

      if (byTransaction.user_id !== user.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json({ success: true, receipt: byTransaction });
    }

    if (receipt.user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("Receipt fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}