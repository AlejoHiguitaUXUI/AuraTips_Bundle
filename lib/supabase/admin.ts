import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serviceRoleKey } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Service-role client that BYPASSES RLS. Use only in Route Handlers for
 * privileged work, and re-implement the authorization check explicitly.
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
