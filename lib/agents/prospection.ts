import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELE_REDACTION } from "@/lib/ia";

export type FicheOffre = {
  presentation: string | null;
  cible: string | null;
  arguments: string | null;
  objections: string | null;
  ton: string | null;
  a_eviter: string | null;
  appel_action: string | null;
  signature: string | null;
};

export type Prospect = {
  nom: string;
  segment: string | null;
  site_web: string | null;
  adresse: string | null;
  etape: string;
  notes: string | null;
  contact: { nom: string; fonction: string | null } | null;
  derniersEchanges: { date: string; direction: string; sujet: string | null; resume: string | null }[];
};

const schema = z.object({
  sujet: z.string().describe("Objet de l'email, moins de 70 caractères, sans majuscules criardes"),
  corps: z.string().describe("Corps de l'email en texte brut, avec sauts de ligne"),
  manques: z
    .array(z.string())
    .describe("Informations qui ont manqué pour mieux personnaliser ou argumenter"),
});

// Agent de prospection : rédige UN brouillon d'email pour UN prospect.
// Il ne fait que proposer : rien n'est envoyé, Fabio valide toujours.
export async function redigerProspection(params: {
  marque: string;
  offre: FicheOffre | null;
  prospect: Prospect;
  modele?: string;
}) {
  const { marque, offre, prospect } = params;
  const modele = params.modele || MODELE_REDACTION;

  const fiche = offre
    ? Object.entries(offre)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `- ${k} : ${v}`)
        .join("\n")
    : "";

  const system = `Tu es Marcus, l'assistant commercial de Fabio Casilli (Moments).
Fabio représente la marque « ${marque} » auprès des agences de voyages et tour-opérateurs français.
Tu rédiges un premier email de prospection B2B, en français, au nom de Fabio.

Règles impératives :
- Court : 120 mots maximum pour le corps, 3 paragraphes courts au plus.
- Personnalisé : appuie-toi sur ce que l'on sait du prospect (segment, notes, échanges). Pas de formule passe-partout.
- N'invente AUCUN fait, chiffre, référence client ou tarif absent de la fiche offre ou des notes. S'il manque une information, écris sans elle et signale-la dans "manques".
- Une seule demande claire en fin de message (l'appel à l'action de la fiche, sinon un échange de 15 minutes).
- Vouvoiement, ton professionnel et chaleureux, sans superlatifs creux ni emojis.
- Termine par la signature de la fiche si elle existe, sinon « Fabio Casilli ».
- Ajoute une dernière ligne discrète permettant de ne plus être sollicité (exigence CNIL pour la prospection B2B).
- Respecte strictement la rubrique a_eviter de la fiche.`;

  const prompt = `FICHE OFFRE ${marque} :
${fiche || "(fiche vide : reste factuel et prudent, et liste ce qui manque)"}

PROSPECT :
- Organisation : ${prospect.nom}
- Segment : ${prospect.segment ?? "inconnu"}
- Site : ${prospect.site_web ?? "inconnu"}
- Adresse : ${prospect.adresse ?? "inconnue"}
- Étape commerciale : ${prospect.etape}
- Contact : ${prospect.contact ? `${prospect.contact.nom}${prospect.contact.fonction ? `, ${prospect.contact.fonction}` : ""}` : "aucun contact nommé"}
- Notes : ${prospect.notes ?? "aucune"}
- Derniers échanges : ${
    prospect.derniersEchanges.length
      ? prospect.derniersEchanges
          .map((e) => `${e.date} (${e.direction}) ${e.sujet ?? ""} — ${e.resume ?? ""}`)
          .join(" | ")
      : "aucun"
  }

Rédige l'email.`;

  const { output } = await generateText({
    model: modele,
    system,
    prompt,
    output: Output.object({ schema }),
  });

  return { ...output, modele };
}
