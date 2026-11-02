import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { deconnexion } from "@/app/actions";
import { supabaseServeur } from "@/lib/supabase/server";
import "./globals.css";

const titre = Fraunces({ variable: "--font-titre", subsets: ["latin"] });
const texte = Inter({ variable: "--font-texte", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marcus",
  description: "L'exécutant de Moments",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await supabaseServeur();
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims?.sub);

  return (
    <html lang="fr" className={`${titre.variable} ${texte.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {connecte && (
          <header className="border-b border-trait bg-carte">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="font-titre text-2xl text-terracotta">
                Marcus
              </Link>
              <nav className="flex items-center gap-4 text-sm text-encre-doux">
                <Link href="/espace/travelmate" className="hover:text-encre">TravelMate</Link>
                <Link href="/espace/mondo" className="hover:text-encre">Mondo</Link>
                <Link href="/ia" className="hover:text-encre">IA</Link>
                <form action={deconnexion}>
                  <button className="hover:text-encre">Déconnexion</button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
