"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redigerProspection, type FicheOffre } from "@/lib/agents/prospection";
import { membreConnecte } from "@/lib/membre";
import { supabaseServeur } from "@/lib/supabase/server";

export async function connexion(formData: FormData) {
  const supabase = await supabaseServeur();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect("/connexion?erreur=1");
  redirect("/");
}

export async function deconnexion() {
  const supabase = await supabaseServeur();
  await supabase.auth.signOut();
  redirect("/connexion");
}

const RUBRIQUES: (keyof FicheOffre)[] = [
  "presentation",
  "cible",
  "arguments",
  "objections",
  "ton",
  "a_eviter",
  "appel_action",
  "signature",
];

export async function enregistrerOffre(formData: FormData) {
  const { supabase } = await membreConnecte();
  const espaceId = String(formData.get("espace_id"));
  const slug = String(formData.get("slug"));
  const valeurs = Object.fromEntries(
    RUBRIQUES.map((r) => [r, String(formData.get(r) ?? "").trim() || null]),
  );
  const { error } = await supabase
    .from("marcus_offres")
    .upsert({ espace_id: espaceId, ...valeurs }, { onConflict: "espace_id" });
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
  revalidatePath(`/espace/${slug}`);
  redirect(`/espace/${slug}?enregistre=1`);
}

export async function genererBrouillon(formData: FormData) {
  const { supabase } = await membreConnecte();
  const organisationId = String(formData.get("organisation_id"));
  const modele = String(formData.get("modele") ?? "") || undefined;

  const { data: org, error } = await supabase
    .from("organisations")
    .select("id, nom, segment, site_web, adresse, etape, notes, espace_id, espaces(nom, slug)")
    .eq("id", organisationId)
    .single();
  if (error || !org) throw new Error("Prospect introuvable.");

  const espace = org.espaces as unknown as { nom: string; slug: string };

  const [{ data: contacts }, { data: offre }, { data: echanges }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, nom, fonction, email")
      .eq("organisation_id", organisationId)
      .order("created_at")
      .limit(5),
    supabase.from("marcus_offres").select("*").eq("espace_id", org.espace_id).maybeSingle(),
    supabase
      .from("echanges")
      .select("date_echange, direction, sujet, resume")
      .eq("organisation_id", organisationId)
      .order("date_echange", { ascending: false })
      .limit(5),
  ]);

  const contact = contacts?.find((c) => c.email) ?? contacts?.[0] ?? null;

  let resultat: Awaited<ReturnType<typeof redigerProspection>>;
  try {
    resultat = await redigerProspection({
    marque: espace.nom,
    offre: offre as FicheOffre | null,
    modele,
    prospect: {
      nom: org.nom,
      segment: org.segment,
      site_web: org.site_web,
      adresse: org.adresse,
      etape: org.etape,
      notes: org.notes,
      contact: contact ? { nom: contact.nom, fonction: contact.fonction } : null,
      derniersEchanges: (echanges ?? []).map((e) => ({
        date: String(e.date_echange).slice(0, 10),
        direction: e.direction,
        sujet: e.sujet,
        resume: e.resume,
      })),
    },
    });
  } catch (e) {
    console.error("Agent de prospection :", e);
    const msg = e instanceof Error ? e.message : "";
    const code = /credit|balance|payment|insufficient|402/i.test(msg) ? "credit" : "ia";
    redirect(`/espace/${espace.slug}?erreur=${code}`);
  }

  const { data: brouillon, error: errIns } = await supabase
    .from("marcus_brouillons")
    .insert({
      espace_id: org.espace_id,
      organisation_id: org.id,
      contact_id: contact?.id ?? null,
      sujet: resultat.sujet,
      corps: resultat.corps,
      modele: resultat.modele,
      note: resultat.manques.length ? `À compléter : ${resultat.manques.join(" ; ")}` : null,
    })
    .select("id")
    .single();
  if (errIns || !brouillon) throw new Error(`Brouillon non enregistré : ${errIns?.message}`);

  redirect(`/brouillons/${brouillon.id}`);
}

export async function majBrouillon(formData: FormData) {
  const { supabase } = await membreConnecte();
  const id = String(formData.get("id"));
  const statut = String(formData.get("statut") ?? "brouillon");
  const { error } = await supabase
    .from("marcus_brouillons")
    .update({
      sujet: String(formData.get("sujet") ?? ""),
      corps: String(formData.get("corps") ?? ""),
      statut,
    })
    .eq("id", id);
  if (error) throw new Error(`Mise à jour impossible : ${error.message}`);
  revalidatePath(`/brouillons/${id}`);
  revalidatePath("/");
  redirect(`/brouillons/${id}?ok=${statut}`);
}
