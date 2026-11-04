// Liest den Anmeldestatus: braucht den Browser
"use client";

import { useAuth } from "../../../hooks/useAuth";
import { WEBSITE_LINKS } from "../../../lib/website/websiteLinks";
import { websiteTexts } from "../../../texts/websiteTexts";
import CtaButton from "../ui/CtaButton";

/** Angemeldet: "Zur App". Sonst "Anmelden" für alle, die Visit Flow schon nutzen. */
export interface NavAccountButtonProps { readonly _?: never; }

export default function NavAccountButton() {
  const { user } = useAuth();
  return user ? (
    <CtaButton href={WEBSITE_LINKS.app}>{websiteTexts.nav.openApp}</CtaButton>
  ) : (
    <CtaButton href={WEBSITE_LINKS.login} variant="glass">
      {websiteTexts.nav.login}
    </CtaButton>
  );
}
