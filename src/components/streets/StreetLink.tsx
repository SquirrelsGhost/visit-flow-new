// Die Rolle kommt aus dem Browser
"use client";

import { Route } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/cn";
import { streetListHref, streetListViewFor, streetRefOfAddress, type StreetRef } from "../../lib/streets/streetLinks";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";

interface StreetLinkProps {
  /** Adresse eines Verkaufs ("Lindenstraße 4, 50667 Köln") oder schon die Straße. */
  address?: string;
  street?: StreetRef | null;
  /** Nur das Symbol, für enge Zeilen. */
  compact?: boolean;
  className?: string;
}

const texts = streetListTexts.links;

/** "Straße öffnen": springt in die eigene Straßenliste und öffnet dort das Straßen-Sheet. Berater sehen nichts. */
export default function StreetLink({ address = "", street, compact = false, className }: StreetLinkProps) {
  const { user } = useAuth();
  const view = user ? streetListViewFor(user) : null;
  const ref = street ?? streetRefOfAddress(address);
  if (!view || !ref) return null;
  const label = fill(texts.openStreetLabel, { street: ref.street });
  return (
    <Link
      href={streetListHref(view, ref)}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-orange-600 transition-colors duration-300 hover:bg-orange-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-orange-300",
        compact ? "h-9 w-9" : "glass-surface h-10 px-3.5",
        className,
      )}
    >
      <Route aria-hidden className="h-4 w-4" />
      {!compact && texts.openStreet}
    </Link>
  );
}
