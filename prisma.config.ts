// Configuration de l'outil Prisma (migrations, génération du client).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // En local : file:./dev.db (voir .env.example).
    // En production : l'adresse libsql:// de la base Turso.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
