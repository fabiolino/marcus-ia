import Link from "next/link";
import { notFound } from "next/navigation";
import { majBrouillon } from "@/app/actions";
import { Bouton } from "@/components/bouton";
import { STATUTS } from "@/lib/libelles";
import { membreConnecte } from "@/lib/membre";

export default async function Brouillon({ params, searchParams }: PageProps<"/brouillons/[id]">) {
  const { id } = await params;
  const { ok } = await searchParams;
  const { supabase } = await membreConnecte();

  const { data: b } = await supabase
    .from("marcus_brouillons")
    .select("*, organisations(nom, site_web), contacts(nom, fonction, email), espaces(nom, slug)")
    .eq("id", id)
    .maybeSingle();
  if (!b) notFound();

  const org = b.organisations as { nom: string; site_web: string | null };
  const contact = b.contacts as { nom: string; fonction: string | null; email: string | null } | null;
  const espace = b.espaces as { nom: string; slug: string };
  const statut = STATUTS[b.statut];

  // Ouvre une fenêtre de rédaction Gmail pré-remplie (rien n'est envoyé automatiquement).
  const gmail =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(contact?.email ?? "")}` +
    `&su=${encodeURIComponent(b.sujet)}` +
    `&body=${encodeURIComponent(b.corps)}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/espace/${espace.slug}`} className="text-sm text-encre-doux hover:text-encre">← {espace.nom}</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-titre text-3xl">{org.nom}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs ${statut.classe}`}>{statut.libelle}</span>
        </div>
        <p className="mt-1 text-sm text-encre-doux">
          {contact ? `Pour ${contact.nom}${contact.fonction ? `, ${contact.fonction}` : ""}${contact.email ? ` <${contact.email}>` : " (pas d'email connu)"}` : "Aucun contact nommé"}
          {" · "}Rédigé par {b.modele ?? "Marcus"}
        </p>
        {ok && <p className="mt-2 text-sm text-olive">Enregistré ✓</p>}
      </div>

      {b.note && (
        <p className="rounded-md border border-ocre/40 bg-ocre/10 p-3 text-sm">{b.note}</p>
      )}

      <form action={majBrouillon} className="space-y-4 rounded-lg border border-trait bg-carte p-5">
        <input type="hidden" name="id" value={b.id} />
        <label className="block text-sm">
          <span className="font-medium">Objet</span>
          <input name="sujet" defaultValue={b.sujet} className="mt-1" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Message</span>
          <textarea name="corps" defaultValue={b.corps} rows={14} className="mt-1 leading-relaxed" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Bouton name="statut" value="valide" attente="…">Valider</Bouton>
          <Bouton name="statut" value="brouillon" variante="contour" attente="…">Enregistrer sans valider</Bouton>
          <Bouton name="statut" value="envoye" variante="contour" attente="…">Marquer comme envoyé</Bouton>
          <Bouton name="statut" value="rejete" variante="discret" attente="…">Rejeter</Bouton>
        </div>
      </form>

      <div className="rounded-lg border border-trait bg-carte p-5 text-sm">
        <p className="font-medium">Envoyer</p>
        <p className="mt-1 text-encre-doux">
          Marcus n&apos;envoie rien lui-même. Enregistre tes modifications, puis ouvre le message dans Gmail pour l&apos;envoyer.
          QG Moments le retrouvera automatiquement grâce à la synchronisation Gmail.
        </p>
        <a href={gmail} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-md bg-terracotta px-4 py-2 font-medium text-white hover:bg-terracotta-fonce">
          Ouvrir dans Gmail
        </a>
      </div>
    </div>
  );
}
