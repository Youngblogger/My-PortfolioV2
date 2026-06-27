import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

const ALLOWED_UPDATE_FIELDS = [
  "full_name",
  "phone",
  "country",
  "state",
  "city",
  "address",
  "company",
  "tax_id",
  "bio",
  "avatar_url",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!profile) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { data: enrollments } = await adminClient
      .from("enrollments")
      .select("*, course:courses(*)")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      profile,
      enrollments: enrollments || [],
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of Object.keys(updates)) {
      if ((ALLOWED_UPDATE_FIELDS as readonly string[]).includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: profile, error } = await adminClient
      .from("profiles")
      .update(filteredUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}