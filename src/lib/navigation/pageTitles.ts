import type { TranslationKey } from "../../texts/i18n/de";
import { CRM_ITEM, HOME_HREF, isActivePath, NAV_LEFT, NAV_RIGHT } from "./navItems";
import { ALL_USER_MENU_LINKS } from "./userMenuItems";

interface PageTitle {
  path: string;
  labelKey: TranslationKey;
}

/** Seiten, die weder in der unteren Navigation noch im Benutzermenü stehen. */
const EXTRA_TITLES: readonly PageTitle[] = [
  { path: HOME_HREF, labelKey: "page.map" },
  { path: "/abrechnung", labelKey: "page.abrechnung" },
  { path: "/provisions-simulator", labelKey: "page.simulator" },
  { path: "/admin-crm-overview", labelKey: "page.crmOverview" },
];

const withoutQuery = (href: string) => href.split("?")[0] ?? href;

/** Titel je Route: eigene Einträge zuerst, dann die Beschriftungen aus Navigation und Menü. */
const PAGE_TITLES: readonly PageTitle[] = [
  ...EXTRA_TITLES,
  ...[...NAV_LEFT, ...NAV_RIGHT, CRM_ITEM, ...ALL_USER_MENU_LINKS].map((item) => ({ path: withoutQuery(item.href), labelKey: item.labelKey })),
];

/** Übersetzungsschlüssel für den Titel in der Topbar; der längste passende Pfad gewinnt, sonst der App-Name. */
export function pageTitleKey(pathname: string): TranslationKey {
  let best: PageTitle | undefined;
  for (const entry of PAGE_TITLES) {
    if (isActivePath(pathname, entry.path) && entry.path.length > (best?.path.length ?? -1)) best = entry;
  }
  return best?.labelKey ?? "app.title";
}
