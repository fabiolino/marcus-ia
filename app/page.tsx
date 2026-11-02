import Link from "next/link";
import { ESPACES_MARCUS } from "@/lib/config";
import { RUBRIQUES_OFFRE, STATUTS, ETAPES_PROSPECTION } from "@/lib/libelles";
import { membreConnecte } from "@/lib/membre";

export default async function Accueil() {
  const { supabase, membre } = await membreConnecte();

  const { data: espaces } = await supabase
    .from("espaces")
    .select("id, slug, nom, couleur, marcus_offres(*)")
    .in("slug", [...ESPACES_MARCUS])
    .order("ordre");

  const ids = (espaces ?? []).map((e) => e.id);
  const [{ data: orgs }, { data: brouillons }] = await Promise.all([
    supabase
      .from("organisations")
      .select("espace_id, etape")
      .in("espace_id", ids)
      .eq("type", "client")
      .eq("archive", false),
    supabase
      .from("marcus_brouillons")
      .select("id, sujet, statut, created_at, espace_id, organisations(nom)")
      .in("espace_id", ids)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-titre text-3xl">Buongiorno{membre ? `, ${membre.nom.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-encre-doux">
          Marcus prépare, tu valides. Rien ne part sans toi.
        </p>
        {!membre && (
          <p className="mt-4 rounded-md bg-terracotta/10 p-3 text-sm text-terracotta">
            Ton compte n&apos;est pas un membre actif de QG Moments : aucune donnée n&apos;est visible.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {(espaces ?? []).map((e) => {
          const offre = (e.marcus_offres as unknown as Record<string, string | null>[] | null)?.[0] ??
            (e.marcus_offres as unknown as Record<string, string | null> | null);
          const remplies = RUBRIQUES_OFFRE.filter((r) => offre?.[r.cle]?.trim()).length;
          const aContacter = (orgs ?? []).filter(
            (o) => o.espace_id === e.id && ETAPES_PROSPECTION.includes(o.etape),
          ).length;
          const enAttente = (brouillons ?? []).filter(
            (b) => b.espace_id === e.id && b.statut === "brouillon",
          ).length;
          return (
            <Link
              key={e.id}
              href={`/espace/${e.slug}`}
              className="rounded-lg border border-trait bg-carte p-5 transition hover:border-terracotta"
            >
              <h2 className="font-titre text-xl">{e.nom}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-xs text-encre-doux">À démarcher</dt>
                  <dd className="text-2xl font-semibold">{aContacter}</dd>
                </div>
                <div>
                  <dt className="text-xs text-encre-doux">À relire</dt>
                  <dd className="text-2xl font-semibold">{enAttente}</dd>
                </div>
                <div>
                  <dt className="text-xs text-encre-doux">Fiche offre</dt>
                  <dd className={`text-2xl font-semibold ${remplies < 4 ? "text-terracotta" : "text-olive"}`}>
                    {remplies}/{RUBRIQUES_OFFRE.length}
                  </dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </section>

      <section>
        <h2 className="font-titre text-xl">Derniers brouillons</h2>
        {brouillons?.length ? (
          <ul className="mt-3 divide-y divide-trait rounded-lg border border-trait bg-carte">
            {brouillons.map((b) => {
              const s = STATUTS[b.statut];
              const org = b.organisations as unknown as { nom: string } | null;
              return (
                <li key={b.id}>
                  <Link href={`/brouillons/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-papier">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{org?.nom}</span>
                      <span className="block truncate text-sm text-encre-doux">{b.sujet}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${s.classe}`}>{s.libelle}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-encre-doux">
            Aucun brouillon pour l&apos;instant. Ouvre TravelMate ou Mondo et demande à Marcus d&apos;en préparer un.
          </p>
        )}
      </section>
    </div>
  );
}
