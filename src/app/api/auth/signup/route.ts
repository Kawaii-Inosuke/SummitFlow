import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, regNo } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.endsWith("@srmist.edu.in")) {
      return NextResponse.json({ error: "Only @srmist.edu.in email addresses are allowed" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Create auth user with email auto-confirmed (no verification email needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile in users table
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      auth_id: authData.user.id,
      name,
      reg_no: regNo || null,
      email,
      role: "Student",
      points: 0,
    });

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
