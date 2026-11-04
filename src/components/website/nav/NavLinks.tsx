import { websiteTexts } from "../../../texts/websiteTexts";

/** Sprungmarken zu den Abschnitten; auf dem Handy ausgeblendet, dort reicht das Scrollen. */
export interface NavLinksProps { readonly _?: never; }

const LINK = "rounded-full px-3.5 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white";

export default function NavLinks() {
  return (
    <div className="hidden items-center gap-0.5 md:flex">
      {websiteTexts.nav.links.map((link) => (
        <a key={link.href} href={link.href} className={LINK}>
          {link.label}
        </a>
      ))}
    </div>
  );
}
