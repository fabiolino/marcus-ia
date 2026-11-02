// Valeurs publiques (conçues pour être visibles côté navigateur).
// La sécurité des données repose sur les règles d'accès (RLS) de Supabase,
// pas sur le secret de ces valeurs.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://xcgxzoppibwkiyrvgsuq.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_yV6Dpd-e8t5Rr6Lbqmocmw_kkx2u5e7";

// Espaces QG Moments couverts par Marcus pour l'instant.
export const ESPACES_MARCUS = ["travelmate", "mondo"] as const;
