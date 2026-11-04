import { WEBSITE_LINKS } from "../../../lib/website/websiteLinks";
import { websiteSectionTexts } from "../../../texts/websiteSectionTexts";
import { websiteTexts } from "../../../texts/websiteTexts";
import CompassMark from "../ui/CompassMark";

/** Fußzeile: Marke und Satz, Sprungmarken, Rechtliches, Hinweis auf Beispieldaten. */
export interface WebsiteFooterProps { readonly _?: never; }

const t = websiteSectionTexts.footer;
const HEAD = "mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40";
const LINK = "text-sm text-white/65 transition-colors hover:text-white";

export default function WebsiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-5 pb-10 pt-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 text-lg font-bold">
            <CompassMark size={30} /> {websiteTexts.brand}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">{t.about}</p>
        </div>
        <nav aria-label={t.product}>
          <p className={HEAD}>{t.product}</p>
          <ul className="space-y-2.5">
            {websiteTexts.nav.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={LINK}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.legal}>
          <p className={HEAD}>{t.legal}</p>
          <ul className="space-y-2.5">
            <li><a href={WEBSITE_LINKS.imprint} className={LINK}>{t.imprint}</a></li>
            <li><a href={WEBSITE_LINKS.privacy} className={LINK}>{t.privacy}</a></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-white/35">
        <p>{t.copyright}</p>
        <p>{t.demo}</p>
      </div>
    </footer>
  );
}
