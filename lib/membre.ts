import { redirect } from "next/navigation";
import { supabaseServeur } from "@/lib/supabase/server";

export type Membre = { id: string; nom: string; email: string; role: string };

// Renvoie le membre QG Moments connecté, ou redirige vers la connexion.
export async function membreConnecte() {
  const supabase = await supabaseServeur();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/connexion");

  const { data: membre } = await supabase
    .from("membres")
    .select("id, nom, email, role")
    .eq("id", id)
    .eq("actif", true)
    .maybeSingle();

  return { supabase, membre: membre as Membre | null };
}
