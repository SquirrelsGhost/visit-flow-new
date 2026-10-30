import { ClipboardList, LineChart, MapPin, Users } from "lucide-react";
import { adminTexts } from "../../texts/adminTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

const texts = adminTexts.shortcuts;

/** Seiten, auf denen ein Admin weiterarbeitet; die Zahlen oben führen dorthin. */
export interface AdminShortcutsProps { readonly _?: never; }

export default function AdminShortcuts() {
  return (
    <GlassSection label={texts.label}>
      <GlassRow icon={Users} tone="indigo" title={texts.teams} href="/teams" />
      <GlassRow icon={MapPin} tone="purple" title={texts.streets} href="/admin-street-list" />
      <GlassRow icon={ClipboardList} tone="red" title={texts.orders} href="/crm" />
      <GlassRow icon={LineChart} tone="green" title={texts.performance} href="/team-performance" />
    </GlassSection>
  );
}
