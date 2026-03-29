import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  const email = "rathoreyashodhansingh@gmail.com";
  const password = "Yashodhan007";
  const name = "Yashodhan Singh Rathore";

  console.log(`Setting up Admin account for ${email}...`);

  try {
    // 1. Check if user exists in auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let authUser = usersData.users.find((u) => u.email === email);

    if (!authUser) {
      console.log("User not found in Auth. Creating newly...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) throw createError;
      authUser = newUser.user;
      console.log("Created Auth user with ID:", authUser!.id);
    } else {
      console.log("User already exists in Auth. Updating password...");
      const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
        password,
        email_confirm: true,
      });
      if (updateError) throw updateError;
      console.log("Password updated.");
    }

    // 2. Check and upsert in public.users table with role 'Admin'
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser!.id)
      .single();

    if (existingUser) {
      console.log("Found profile in public.users. Updating role to Admin...");
      const { error: updateProfileError } = await supabase
        .from("users")
        .update({ role: "Admin", name, email })
        .eq("auth_id", authUser!.id);

      if (updateProfileError) throw updateProfileError;
    } else {
      console.log("Profile not found in public.users. Creating profile with Admin role...");
      const { error: insertError } = await supabase.from("users").insert({
        auth_id: authUser!.id,
        name,
        email,
        role: "Admin",
      });

      if (insertError) throw insertError;
    }

    console.log("✅ Admin setup complete. You can now login with these credentials.");
  } catch (err) {
    console.error("❌ Failed to setup admin:", err);
  }
}

setupAdmin();
