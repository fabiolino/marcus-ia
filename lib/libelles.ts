export const STATUTS: Record<string, { libelle: string; classe: string }> = {
  brouillon: { libelle: "À relire", classe: "bg-ocre/15 text-ocre" },
  valide: { libelle: "Validé", classe: "bg-olive/15 text-olive" },
  envoye: { libelle: "Envoyé", classe: "bg-encre/10 text-encre" },
  rejete: { libelle: "Rejeté", classe: "bg-terracotta/10 text-terracotta" },
};

export const RUBRIQUES_OFFRE: { cle: string; libelle: string; aide: string }[] = [
  { cle: "presentation", libelle: "Présentation", aide: "Ce que tu vends, en 3-4 phrases." },
  { cle: "cible", libelle: "Cible", aide: "Types d'agences / TO visés, taille, spécialités, régions. Qui exclure." },
  { cle: "arguments", libelle: "Arguments", aide: "Bénéfices clés pour l'agence, preuves, chiffres vérifiés, références autorisées." },
  { cle: "objections", libelle: "Objections fréquentes", aide: "Ce qu'on te répond souvent, et ta réponse." },
  { cle: "ton", libelle: "Ton", aide: "Style à adopter (ex. direct, chaleureux, expert)." },
  { cle: "a_eviter", libelle: "À éviter", aide: "Ce qu'il ne faut jamais dire ou promettre." },
  { cle: "appel_action", libelle: "Appel à l'action", aide: "Ce que tu demandes au prospect (ex. un appel de 15 min)." },
  { cle: "signature", libelle: "Signature", aide: "Ta signature d'email pour cette marque." },
];

export const ETAPES_PROSPECTION = ["Prêt à contacter", "Cible identifiée", "À qualifier"];
