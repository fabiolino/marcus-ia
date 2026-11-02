import { FOURNISSEURS, MODELE_REDACTION, modelesDisponibles } from "@/lib/ia";
import { membreConnecte } from "@/lib/membre";

export default async function IA() {
  await membreConnecte();
  const modeles = await modelesDisponibles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titre text-3xl">Les IA de Marcus</h1>
        <p className="mt-1 text-encre-doux">
          Toutes passent par une seule porte (Vercel AI Gateway) : une facture, aucune clé à gérer.
          Rédaction par défaut : <code className="rounded bg-trait/60 px-1">{MODELE_REDACTION}</code>
        </p>
      </div>
      {modeles.length === 0 ? (
        <p className="rounded-md bg-terracotta/10 p-3 text-sm text-terracotta">
          La passerelle d&apos;IA ne répond pas. Elle ne fonctionne qu&apos;une fois en ligne sur Vercel
          (ou en local avec une clé AI_GATEWAY_API_KEY).
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(FOURNISSEURS).map(([cle, nom]) => {
            const groupe = modeles.filter((m) => m.fournisseur === cle);
            return (
              <section key={cle} className="rounded-lg border border-trait bg-carte p-4">
                <h2 className="font-titre text-lg">{nom}</h2>
                {groupe.length ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {groupe.map((m) => (
                      <li key={m.id}><code>{m.id}</code></li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-encre-doux">Non disponible sur la passerelle.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
