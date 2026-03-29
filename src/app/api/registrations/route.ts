import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      event_id,
      qr_hash,
      full_name,
      student_id,
      phone,
      primary_interest,
    } = body;

    if (!user_id || !event_id || !qr_hash || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for duplicate registration
    const { data: existing } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("user_id", user_id)
      .eq("event_id", event_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        user_id,
        event_id,
        qr_hash,
        status: "Pending",
        full_name,
        student_id: student_id || null,
        phone: phone || null,
        primary_interest: primary_interest || null,
        feedback_submitted: false,
        feedback_rating: null,
        feedback_liked: null,
        feedback_improved: null,
        certificate_generated: false,
        checked_in_at: null,
        checked_in_by: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
