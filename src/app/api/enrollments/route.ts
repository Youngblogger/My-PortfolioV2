import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendEnrollmentConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id, tier_id, user_id, billing } = body;

    if (!course_id || !user_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", course_id)
      .single();

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }

    const enrollmentNumber = `CMA-${new Date().getFullYear().toString().slice(-2)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        user_id,
        course_id,
        tier_id: tier_id || null,
        enrollment_number: enrollmentNumber,
        status: "active",
        metadata: { billing, is_free: true },
      })
      .select()
      .single();

    if (enrollmentError) {
      if (enrollmentError.code === "23505") {
        return NextResponse.json({ success: false, error: "Already enrolled in this course" }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: "Failed to create enrollment" }, { status: 500 });
    }

    await supabase
      .from("courses")
      .update({ students_enrolled: (course.students_enrolled || 0) + 1 })
      .eq("id", course.id);

    if (billing?.email) {
      const origin = request.headers.get("origin") || "http://localhost:3000";
      await sendEnrollmentConfirmation({
        email: billing.email,
        student_name: billing.full_name || "Student",
        course_name: course.title,
        enrollment_number: enrollmentNumber,
        amount: "Free",
        dashboard_url: `${origin}/academy/enrollment/${enrollment.id}`,
      });
    }

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.id,
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing enrollment ID" }, { status: 400 });
    }

    const supabaseAuth = await createServerSupabase();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 });
    }

    if (enrollment.user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", enrollment.course_id)
      .maybeSingle();

    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("enrollment_id", id)
      .maybeSingle();

    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("enrollment_id", id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      enrollment,
      course,
      transaction,
      invoice,
    });
  } catch (error) {
    console.error("Enrollment fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}