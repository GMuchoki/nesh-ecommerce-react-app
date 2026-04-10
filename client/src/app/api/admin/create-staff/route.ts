import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * POST /api/admin/create-staff
 *
 * Creates a new salesperson account via the Supabase Admin API.
 * Requires the caller to be an authenticated admin.
 * Uses the Service Role Key to bypass auth restrictions.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // ── Step 1: Extract and verify caller identity ──
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid caller token" }, { status: 401 });
    }

    // ── Step 2: Verify caller is an admin ──
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // ── Step 3: Create the new user via Service Role ──
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;
    const newUserId = authData.user.id;

    // ── Step 4: Set salesperson role ──
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: fullName, role: "salesperson" })
      .eq("id", newUserId);

    if (profileError) {
      // Fallback: insert if no trigger created the profile automatically
      await supabaseAdmin
        .from("profiles")
        .insert([{ id: newUserId, full_name: fullName, role: "salesperson" }]);
    }

    console.log(`💼 [STAFF] Admin ${user.email} provisioned Sales Agent: ${fullName}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Staff provisioning failed";
    console.error("[ADMIN] Staff provisioning error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
