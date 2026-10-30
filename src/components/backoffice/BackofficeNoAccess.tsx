import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { backofficeTexts as t } from "../../texts/backofficeTexts";
import GlassBody from "../glass/GlassBody";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

/** Hinweis bei fehlendem Zugriff auf das Team-Backoffice. */
export interface BackofficeNoAccessProps { readonly _?: never; }

export default function BackofficeNoAccess() {
  return (
    <GlassBody>
      <GlassSection footer={t.noAccess.text}>
        <GlassRow icon={ShieldAlert} tone="gray" title={t.noAccess.title} />
        <GlassRow icon={LayoutDashboard} tone="red" title={t.noAccess.link} href="/daily-view" />
      </GlassSection>
    </GlassBody>
  );
}
