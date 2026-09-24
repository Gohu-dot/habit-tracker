import { createClient } from "@supabase/supabase-js";

// Client Supabase "admin" : utilise la clé service_role, qui contourne les
// policies RLS. Réservé au code serveur (routes API), jamais importé dans un
// composant "use client" — la clé ne doit jamais atteindre le navigateur.
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
