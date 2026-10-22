import { loginTexts } from "../../texts/loginTexts";

/** Platzhalter für Reiter, die noch nicht aus v1 übernommen sind. */
export default function TabPending() {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {loginTexts.tabPending}
    </p>
  );
}
