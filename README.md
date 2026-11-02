# Marcus

L'exécutant de Moments : des agents IA qui préparent le travail de Fabio
(prospection, relances, publications…) à partir des données de QG Moments.
Marcus prépare, Fabio valide : rien n'est envoyé automatiquement.

## Stack

- Next.js 16 (App Router, `app/` à la racine), React 19, TypeScript, Tailwind CSS 4
- Données : base Supabase **« Moments »**, partagée avec QG Moments
  - Marcus lit les tables de QG Moments (`organisations`, `contacts`, `echanges`, …)
  - Ses propres tables sont préfixées `marcus_` (`marcus_offres`, `marcus_brouillons`)
  - Mêmes règles d'accès (RLS) que QG Moments : `peut_voir` / `peut_ecrire` par espace
  - La structure de la base est gérée par migrations Supabase, pas depuis ce dépôt
- Connexion : comptes Supabase Auth de QG Moments (email + mot de passe)
- IA : Vercel AI Gateway (Claude, ChatGPT, Gemini, Perplexity, Mistral)
  - sur Vercel : authentification automatique (OIDC), aucune clé dans le code
- Hébergement : Vercel, équipe Respire, projet `marcus-ia`

## Organisation du code

- `proxy.ts` : protège toutes les pages (redirection vers `/connexion`)
- `lib/supabase/server.ts` : client Supabase lié à la session
- `lib/ia.ts` : passerelle d'IA, modèles disponibles, modèle par défaut
- `lib/agents/` : un fichier par agent (`prospection.ts`)
- `app/actions.ts` : actions serveur (connexion, fiche offre, brouillons)
- `app/espace/[slug]` : fiche offre + prospects d'une marque
- `app/brouillons/[id]` : relecture, validation, ouverture dans Gmail

## Démarrer en local (Codespace)

```bash
cp .env.example .env.local   # puis renseigner AI_GATEWAY_API_KEY pour tester l'IA
npm install
npm run dev
```
