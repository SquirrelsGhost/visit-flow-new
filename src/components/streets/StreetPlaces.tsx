import { ChevronDown, MapPinOff, Signpost } from "lucide-react";
import { useState } from "react";
import type { StreetPlace } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import StreetRowButton from "./StreetRowButton";

interface StreetPlacesProps {
  places: readonly StreetPlace[];
  /** Es gibt Straßen, nur die Suche oder Gruppe blendet alle aus. */
  hasData: boolean;
  loading: boolean;
  failed: boolean;
  manage: boolean;
  onOpen: (key: string) => void;
}

const texts = streetListTexts.list;
/** So viele Straßen auf einmal; bei "Gesamt" können es Tausende sein. */
const PAGE = 60;

/** Straßen nach "PLZ Ort" in Glas-Gruppen (v1 lila Ortsbalken), mit "Mehr anzeigen" bei langen Listen. */
export default function StreetPlaces({ places, hasData, loading, failed, manage, onOpen }: StreetPlacesProps) {
  const [limit, setLimit] = useState(PAGE);
  if (places.length === 0) {
    const message = loading ? texts.loading : failed ? texts.error : hasData ? texts.emptySearch : texts.empty;
    return (
      <GlassSection>
        <GlassRow icon={loading ? Signpost : MapPinOff} tone="gray" title={message} />
      </GlassSection>
    );
  }

  const shown: StreetPlace[] = [];
  for (const place of places) {
    const used = shown.reduce((sum, p) => sum + p.rows.length, 0);
    if (used >= limit) break;
    shown.push({ ...place, rows: place.rows.slice(0, limit - used) });
  }
  const total = places.reduce((sum, p) => sum + p.rows.length, 0);
  const last = shown.length - 1;

  return (
    <>
      {shown.map((place, i) => (
        <GlassSection key={place.key} label={place.key} footer={i === last && total <= limit ? (manage ? texts.footerAdmin : texts.footer) : undefined}>
          {place.rows.map((row) => (
            <StreetRowButton key={row.key} row={row} onOpen={() => onOpen(row.key)} />
          ))}
        </GlassSection>
      ))}
      {total > limit && (
        <GlassSection>
          <GlassRow icon={ChevronDown} tone="indigo" title={fill(texts.more, { count: total - limit })} onClick={() => setLimit((l) => l + PAGE)} chevron={false} />
        </GlassSection>
      )}
    </>
  );
}
