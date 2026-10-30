import { Network } from "lucide-react";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

/** Weg aus der Übersicht zur Seite Meine Teams. */
export interface MyTeamsLinkProps { readonly _?: never; }

export default function MyTeamsLink() {
  return (
    <GlassSection>
      <GlassRow icon={Network} tone="red" title={teamsTexts.openPage} subtitle={teamsTexts.openPageHint} href="/teams" />
    </GlassSection>
  );
}
