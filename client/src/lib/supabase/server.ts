import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the Service Role Key.
 * This client BYPASSES Row-Level Security and must ONLY be
 * used inside Next.js Route Handlers (app/api/).
 *
 * NEVER import this from a client component.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
