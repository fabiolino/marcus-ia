import Link from "next/link";
import { notFound } from "next/navigation";
import { enregistrerOffre, genererBrouillon } from "@/app/actions";
import { Bouton } from "@/components/bouton";
import { FOURNISSEURS, MODELE_REDACTION, modelesDisponibles } from "@/lib/ia";
import { ETAPES_PROSPECTION, RUBRIQUES_OFFRE, STATUTS } from "@/lib/libelles";
import { membreConnecte } from "@/lib/membre";

// La rédaction par l'IA peut prendre quelques dizaines de secondes.
export const maxDuration = 60;

export default async function Espace({ params, searchParams }: PageProps<"/espace/[slug]">) {
  const { slug } = await params;
  const { modele, enregistre, tout } = await searchParams;
  const { supabase } = await membreConnecte();

  const { data: espace } = await supabase
    .from("espaces")
    .select("id, slug, nom")
    .eq("slug", slug)
    .maybeSingle();
  if (!espace) notFound();

  let requete = supabase
    .from("organisations")
    .select("id, nom, segment, etape, priorite, notes, dernier_contact, contacts(nom, fonction, email), marcus_brouillons(id, statut, created_at)")
    .eq("espace_id", espace.id)
    .eq("type", "client")
    .eq("archive", false)
    .order("priorite")
    .order("nom");
  if (!tout) requete = requete.in("etape", ETAPES_PROSPECTION);

  const [{ data: offre }, { data: prospects }, modeles] = await Promise.all([
    supabase.from("marcus_offres").select("*").eq("espace_id", espace.id).maybeSingle(),
    requete,
    modelesDisponibles(),
  ]);

  const modeleChoisi = typeof modele === "string" && modele ? modele : MODELE_REDACTION;
  const remplies = RUBRIQUES_OFFRE.filter((r) => offre?.[r.cle]?.trim()).length;
  const ordreEtapes = (e: string) => {
    const i = ETAPES_PROSPECTION.indexOf(e);
    return i === -1 ? 99 : i;
  };
  const liste = [...(prospects ?? [])].sort((a, b) => ordreEtapes(a.etape) - ordreEtapes(b.etape));

  return (
    <div className="space-y-10">
      <div>
        <Link href="/" className="text-sm text-encre-doux hover:text-encre">← Accueil</Link>
        <h1 className="mt-2 font-titre text-3xl">{espace.nom}</h1>
      </div>

      {/* Fiche offre */}
      <details open={remplies < 4 || Boolean(enregistre)} className="rounded-lg border border-trait bg-carte">
        <summary className="cursor-pointer px-5 py-4">
          <span className="font-titre text-xl">Fiche offre</span>{" "}
          <span className={`ml-2 text-sm ${remplies < 4 ? "text-terracotta" : "text-olive"}`}>
            {remplies}/{RUBRIQUES_OFFRE.length} rubriques remplies
          </span>
          {enregistre && <span className="ml-3 text-sm text-olive">Enregistrée ✓</span>}
        </summary>
        <form action={enregistrerOffre} className="space-y-4 border-t border-trait px-5 py-5">
          <p className="text-sm text-encre-doux">
            C&apos;est ce que Marcus sait de {espace.nom}. Plus elle est précise, moins les brouillons sont génériques.
            Marcus n&apos;invente rien qui ne soit pas écrit ici.
          </p>
          <input type="hidden" name="espace_id" value={espace.id} />
          <input type="hidden" name="slug" value={espace.slug} />
          {RUBRIQUES_OFFRE.map((r) => (
            <label key={r.cle} className="block text-sm">
              <span className="font-medium">{r.libelle}</span>
              <span className="ml-2 text-encre-doux">{r.aide}</span>
              <textarea
                name={r.cle}
                defaultValue={offre?.[r.cle] ?? ""}
                rows={r.cle === "presentation" || r.cle === "arguments" ? 4 : 2}
                className="mt-1"
              />
            </label>
          ))}
          <Bouton attente="Enregistrement…">Enregistrer la fiche</Bouton>
        </form>
      </details>

      {/* Prospects */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-titre text-xl">Prospects</h2>
            <p className="text-sm text-encre-doux">
              {tout ? "Tous les clients de l'espace." : `Étapes : ${ETAPES_PROSPECTION.join(", ")}.`}{" "}
              <Link href={tout ? `/espace/${slug}` : `/espace/${slug}?tout=1`} className="underline underline-offset-4">
                {tout ? "Voir seulement les prospects" : "Voir tous les clients"}
              </Link>
            </p>
          </div>
          <form className="flex items-end gap-2 text-sm">
            {tout && <input type="hidden" name="tout" value="1" />}
            <label>
              <span className="text-encre-doux">IA de rédaction</span>
              <select name="modele" defaultValue={modeleChoisi} className="mt-1 min-w-64">
                {!modeles.some((m) => m.id === modeleChoisi) && <option value={modeleChoisi}>{modeleChoisi}</option>}
                {Object.entries(FOURNISSEURS).map(([cle, nom]) => {
                  const groupe = modeles.filter((m) => m.fournisseur === cle);
                  return groupe.length ? (
                    <optgroup key={cle} label={nom}>
                      {groupe.map((m) => (
                        <option key={m.id} value={m.id}>{m.nom}</option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>
            <button className="rounded-md border border-trait bg-carte px-3 py-2">Choisir</button>
          </form>
        </div>

        {liste.length ? (
          <ul className="mt-4 space-y-3">
            {liste.map((p) => {
              const contacts = (p.contacts ?? []) as { nom: string; fonction: string | null; email: string | null }[];
              const brouillons = ((p.marcus_brouillons ?? []) as { id: string; statut: string; created_at: string }[])
                .sort((a, b) => b.created_at.localeCompare(a.created_at));
              const dernier = brouillons[0];
              return (
                <li key={p.id} className="rounded-lg border border-trait bg-carte p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{p.nom}</p>
                      <p className="text-sm text-encre-doux">
                        {[p.segment, p.etape, `priorité ${p.priorite.toLowerCase()}`].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 text-sm">
                        {contacts.length
                          ? contacts.map((c) => `${c.nom}${c.email ? "" : " (sans email)"}`).join(", ")
                          : <span className="text-terracotta">Aucun contact nommé</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {dernier && (
                        <Link href={`/brouillons/${dernier.id}`} className={`rounded-full px-2 py-0.5 text-xs ${STATUTS[dernier.statut].classe}`}>
                          {STATUTS[dernier.statut].libelle}
                        </Link>
                      )}
                      <form action={genererBrouillon}>
                        <input type="hidden" name="organisation_id" value={p.id} />
                        <input type="hidden" name="modele" value={modeleChoisi} />
                        <Bouton variante={dernier ? "contour" : "plein"} attente="Marcus rédige…">
                          {dernier ? "Nouveau brouillon" : "Préparer un brouillon"}
                        </Bouton>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-encre-doux">Aucun prospect à ces étapes dans QG Moments.</p>
        )}
      </section>
    </div>
  );
}
