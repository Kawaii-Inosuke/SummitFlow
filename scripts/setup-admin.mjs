import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tngidkbdzywoyrmpxvhz.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  const email = "rathoreyashodhansingh@gmail.com";
  const password = "Yashodhan007";

  // Check if auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let authUserId;

  if (existing) {
    console.log("Auth user already exists, updating password...");
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to update user:", error.message);
      process.exit(1);
    }
    authUserId = existing.id;
  } else {
    console.log("Creating auth user...");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create auth user:", error.message);
      process.exit(1);
    }
    authUserId = data.user.id;
  }

  console.log("Auth user ID:", authUserId);

  // Upsert user profile in users table
  const { error: profileError } = await supabase.from("users").upsert(
    {
      auth_id: authUserId,
      name: "Yashodhan Singh Rathore",
      email,
      role: "Admin",
      reg_no: null,
      points: 0,
    },
    { onConflict: "auth_id" }
  );

  if (profileError) {
    console.error("Failed to upsert user profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin account ready!");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role: Admin`);
}

setupAdmin();
