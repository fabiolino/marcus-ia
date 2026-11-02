"use client";

import { useFormStatus } from "react-dom";

// Bouton d'envoi de formulaire qui affiche un état d'attente.
export function Bouton({
  children,
  attente = "Un instant…",
  variante = "plein",
  name,
  value,
}: {
  children: React.ReactNode;
  attente?: string;
  variante?: "plein" | "contour" | "discret";
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    plein: "bg-terracotta text-white hover:bg-terracotta-fonce",
    contour: "border border-terracotta text-terracotta hover:bg-terracotta/10",
    discret: "text-encre-doux hover:text-encre underline underline-offset-4",
  }[variante];
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${styles}`}
    >
      {pending ? attente : children}
    </button>
  );
}
