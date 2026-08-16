// Supabase Edge Function: admin-grant-pro
// Deploy with: supabase functions deploy admin-grant-pro
//
// Replaces admin-bx2026.html's old givePro()/changePlan() functions,
// which wrote profiles.plan directly via the anon key — a second,
// disconnected Pro authority with no real authorization check.
//
// Requires 'super_admin' role specifically (stricter than the
// general admin-role check used elsewhere) since this grants
// money-equivalent access. Every grant/revoke is written to
// admin_audit_log. A normal admin/support/finance/content_manager
// role CANNOT call this successfully — only super_admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401 });
  }

  const { data: roleRow } = await admin
    .from("admin_roles")
    .select("role, is_active")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!roleRow || !roleRow.is_active || roleRow.role !== "super_admin") {
    await admin.from("admin_audit_log").insert({
      actor_id: userData.user.id, actor_email: userData.user.email,
      action: "PRO_GRANT_ATTEMPT_DENIED", target_type: "user", success: false,
      metadata: { reason: "requires_super_admin", actual_role: roleRow?.role ?? null },
    });
    return new Response(JSON.stringify({ error: "super_admin role required" }), { status: 403 });
  }

  let body: { action?: string; target_user_id?: string; reason?: string; expires_at?: string; grant_id?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (body.action === "list_grants") {
    if (!body.target_user_id) {
      return new Response(JSON.stringify({ error: "Missing target_user_id" }), { status: 400 });
    }
    const { data: grants, error: listErr } = await admin
      .from("admin_pro_grants")
      .select("id, granted_by, reason, revoked, revoked_at, expires_at, created_at")
      .eq("user_id", body.target_user_id)
      .order("created_at", { ascending: false });
    if (listErr) {
      return new Response(JSON.stringify({ error: "Could not load grants" }), { status: 500 });
    }
    return new Response(JSON.stringify({ grants }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (body.action === "grant") {
    if (!body.target_user_id) {
      return new Response(JSON.stringify({ error: "Missing target_user_id" }), { status: 400 });
    }
    // Confirm the target user actually exists before granting anything.
    const { data: targetUser, error: targetErr } = await admin.auth.admin.getUserById(body.target_user_id);
    if (targetErr || !targetUser?.user) {
      return new Response(JSON.stringify({ error: "Target user not found" }), { status: 404 });
    }

    const { data: grant, error: insertErr } = await admin
      .from("admin_pro_grants")
      .insert({
        user_id: body.target_user_id,
        granted_by: userData.user.id,
        reason: body.reason || null,
        expires_at: body.expires_at || null,
      })
      .select("id")
      .single();

    await admin.from("admin_audit_log").insert({
      actor_id: userData.user.id, actor_email: userData.user.email,
      action: "PRO_GRANT_CREATED", target_type: "user", target_id: body.target_user_id,
      success: !insertErr, metadata: { reason: body.reason || null, expires_at: body.expires_at || null },
    });

    if (insertErr) {
      console.error("Pro grant insert failed:", insertErr);
      return new Response(JSON.stringify({ error: "Could not create grant" }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true, grant_id: grant.id }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (body.action === "revoke") {
    if (!body.grant_id) {
      return new Response(JSON.stringify({ error: "Missing grant_id" }), { status: 400 });
    }
    const { error: updateErr } = await admin
      .from("admin_pro_grants")
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq("id", body.grant_id);

    await admin.from("admin_audit_log").insert({
      actor_id: userData.user.id, actor_email: userData.user.email,
      action: "PRO_GRANT_REVOKED", target_type: "admin_pro_grant", target_id: body.grant_id,
      success: !updateErr,
    });

    if (updateErr) {
      return new Response(JSON.stringify({ error: "Could not revoke grant" }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Unknown action — expected 'grant' or 'revoke'" }), { status: 400 });
});
