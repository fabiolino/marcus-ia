import { connexion } from "@/app/actions";
import { Bouton } from "@/components/bouton";

export default async function Connexion({ searchParams }: PageProps<"/connexion">) {
  const { erreur } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="font-titre text-4xl text-terracotta">Marcus</h1>
      <p className="mt-2 text-encre-doux">L&apos;exécutant de Moments. Connecte-toi avec ton compte QG Moments.</p>
      <form action={connexion} className="mt-8 space-y-4 rounded-lg border border-trait bg-carte p-6">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1" />
        </label>
        <label className="block text-sm">
          Mot de passe
          <input name="password" type="password" required autoComplete="current-password" className="mt-1" />
        </label>
        {erreur && <p className="text-sm text-terracotta">Email ou mot de passe incorrect.</p>}
        <Bouton attente="Connexion…">Se connecter</Bouton>
      </form>
    </div>
  );
}
