# Marcus IA

Application SaaS de génération automatisée de contenu SEO.

## Stack

- Next.js 16 (App Router, dossier `app/` à la racine), React 19, TypeScript
- Tailwind CSS 4
- Prisma 7.10 (ORM) avec l'adaptateur libSQL
  - en local : fichier SQLite `dev.db`
  - en production : base Turso (SQLite hébergé), à créer
- Hébergement : Vercel (équipe Respire, projet `marcus-ia`)

## Démarrer en local (Codespace)

```bash
cp .env.example .env      # une seule fois
npm install               # installe et génère le client Prisma
npm run db:migrate        # crée/met à jour la base locale dev.db
npm run dev
```

## Base de données

- Schéma : `prisma/schema.prisma`
- Configuration de l'outil Prisma : `prisma.config.ts` (contient l'adresse de la base)
- Accès depuis le code : `import { prisma } from "@/lib/prisma"`
- Explorer les données : `npm run db:studio`

Important : `prisma` et `@prisma/client` doivent toujours avoir exactement la même version.
Ne pas lancer `npm install prisma` sans numéro de version (l'étiquette « latest » de npm
pointe actuellement vers une version de test 8.0).
