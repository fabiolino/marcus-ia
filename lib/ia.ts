import { gateway } from "ai";

// Toutes les IA passent par une seule porte : Vercel AI Gateway.
// Sur Vercel, l'authentification est automatique (jeton OIDC du projet) :
// aucune clé d'IA n'est stockée dans le code ni dans le dépôt.

// Les fournisseurs retenus pour Marcus (voir mémoire du projet).
export const FOURNISSEURS = {
  anthropic: "Claude",
  openai: "ChatGPT",
  google: "Gemini",
  perplexity: "Perplexity",
  mistral: "Mistral",
} as const;

// Modèle utilisé par défaut pour la rédaction (modifiable sans toucher au code
// via la variable d'environnement MARCUS_MODELE_REDACTION dans Vercel).
export const MODELE_REDACTION =
  process.env.MARCUS_MODELE_REDACTION ?? "anthropic/claude-sonnet-5.5";

export type ModeleDispo = { id: string; nom: string; fournisseur: string };

// Liste des modèles de texte réellement disponibles sur la passerelle,
// limitée aux fournisseurs retenus.
export async function modelesDisponibles(): Promise<ModeleDispo[]> {
  try {
    const { models } = await gateway.getAvailableModels();
    return models
      .filter((m) => (m.modelType ?? "language") === "language")
      .map((m) => ({ id: m.id, nom: m.name ?? m.id, fournisseur: m.id.split("/")[0] }))
      .filter((m) => m.fournisseur in FOURNISSEURS)
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}
