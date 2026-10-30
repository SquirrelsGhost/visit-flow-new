import { LayoutDashboard, Users } from "lucide-react";
import { teamsTexts } from "../../texts/teamsTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

const texts = teamsTexts.noAccess;

/** Berater ohne eigene Leute: kurzer Hinweis und der Weg zurück in die Übersicht. */
export interface OrgNoAccessProps { readonly _?: never; }

export default function OrgNoAccess() {
  return (
    <GlassSection footer={texts.text}>
      <GlassRow icon={Users} tone="gray" title={texts.title} />
      <GlassRow icon={LayoutDashboard} tone="red" title={texts.link} href="/daily-view" />
    </GlassSection>
  );
}
