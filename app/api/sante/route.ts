import { gateway } from "ai";
import { MODELE_REDACTION, modelesDisponibles } from "@/lib/ia";

// Vérification technique publique : la passerelle d'IA répond-elle, et reste-t-il du crédit ?
// Ne renvoie aucune donnée de QG Moments.
export async function GET() {
  const modeles = await modelesDisponibles();
  const parFournisseur = modeles.reduce<Record<string, number>>((acc, m) => {
    acc[m.fournisseur] = (acc[m.fournisseur] ?? 0) + 1;
    return acc;
  }, {});
  let credit: string | null = null;
  try {
    const c = await gateway.getCredits();
    credit = String(c.balance);
  } catch (e) {
    credit = `inconnu (${e instanceof Error ? e.message : "erreur"})`;
  }
  return Response.json({
    ia: modeles.length > 0 ? "ok" : "indisponible",
    modeleRedaction: MODELE_REDACTION,
    modeleRedactionDisponible: modeles.some((m) => m.id === MODELE_REDACTION),
    modeles: parFournisseur,
    credit,
  });
}
