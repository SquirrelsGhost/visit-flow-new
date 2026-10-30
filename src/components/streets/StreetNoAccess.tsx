import { Lock } from "lucide-react";
import type { StreetView } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassBody from "../glass/GlassBody";
import GlassPage from "../glass/GlassPage";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";

const texts = streetListTexts.noAccess;

/** Hinweis statt Liste, wenn die Rolle nicht passt (v1 "Zugriff verweigert"). */
export interface StreetNoAccessProps { view: StreetView }

export default function StreetNoAccess({ view }: StreetNoAccessProps) {
  return (
    <GlassPage>
      <GlassBody>
        <GlassSection>
          <GlassRow icon={Lock} tone="gray" title={texts.title} subtitle={fill(texts.text, { role: texts.role[view] })} />
        </GlassSection>
      </GlassBody>
    </GlassPage>
  );
}
