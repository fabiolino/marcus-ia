import { modelesDisponibles } from "@/lib/ia";

// Vérification technique publique : la passerelle d'IA répond-elle ?
// Ne renvoie aucune donnée de QG Moments.
export async function GET() {
  const modeles = await modelesDisponibles();
  const parFournisseur = modeles.reduce<Record<string, number>>((acc, m) => {
    acc[m.fournisseur] = (acc[m.fournisseur] ?? 0) + 1;
    return acc;
  }, {});
  return Response.json({
    ia: modeles.length > 0 ? "ok" : "indisponible",
    modeles: parFournisseur,
    exemples: modeles.filter((m) => /sonnet|gpt|gemini|sonar|mistral-large|mistral-medium/.test(m.id)).map((m) => m.id).slice(0, 40),
  });
}
