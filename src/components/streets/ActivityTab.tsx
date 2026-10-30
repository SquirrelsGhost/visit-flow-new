// Zeitraum, Suche und Laden leben im Browser
"use client";

import { Network } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { useStreetData } from "../../hooks/useStreetData";
import { useScopedPeople } from "../../hooks/useStreetList";
import { localDay } from "../../lib/overview/todayStats";
import { computeActivity, periodFilter, type ActivityPeriod } from "../../lib/streets/streetActivity";
import type { StreetPeople } from "../../lib/streets/streetApi";
import type { StreetScope } from "../../lib/streets/streetScope";
import type { StreetDateFilter } from "../../lib/streets/streetTypes";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassBody from "../glass/GlassBody";
import GlassSplit from "../glass/GlassSplit";
import GlassRow from "../glass/GlassRow";
import GlassSection from "../glass/GlassSection";
import ActivityFilters from "./ActivityFilters";
import ActivityRow from "./ActivityRow";

interface ActivityTabProps {
  scope: StreetScope;
  people: StreetPeople | null | undefined;
}

const texts = streetListTexts.activity;

/** Reiter Aktivität (v1 AllUsersActivityTab): je Person Tage mit Türen, Verkäufe, Umsatz und Türen im Zeitraum. */
export default function ActivityTab({ scope, people }: ActivityTabProps) {
  const today = localDay(new Date());
  const [period, setPeriod] = useState<ActivityPeriod>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [custom, setCustom] = useState<StreetDateFilter>({ mode: "range", from: today, to: today });
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const filter = useMemo(() => (period === "custom" ? custom : periodFilter(period, anchor)), [period, anchor, custom]);
  const { data, loading } = useStreetData(scope.view, filter, scope.teamId);
  const { inView, restrict } = useScopedPeople(scope, people);

  const rows = useMemo(() => {
    const persons = inView.map((u) => ({ id: u.id, name: u.name, role: u.role }));
    const all = data ? computeActivity(persons, restrict(data).doors, restrict(data).products, filter) : [];
    const q = deferred.trim().toLowerCase();
    return q ? all.filter((r) => r.person.name.toLowerCase().includes(q)) : all;
  }, [inView, data, restrict, deferred, filter]);
  const top = rows[0]?.days ? rows[0].person.id : null;
  const waiting = data === undefined || (loading && rows.length === 0);

  return (
    <GlassBody layout="wide">
      <GlassSplit sticky aside={<ActivityFilters period={period} onPeriod={setPeriod} anchor={anchor} onAnchor={setAnchor} custom={custom} onCustom={setCustom} filter={filter} query={query} onQuery={setQuery} />}>
        <GlassSection label={rows.length === 1 ? texts.labelOne : fill(texts.label, { count: rows.length })} footer={texts.footer}>
          {waiting && <p className="px-4 py-5 text-[13px] text-muted-foreground">{texts.loading}</p>}
          {!waiting && rows.length === 0 && <p className="px-4 py-5 text-[13px] text-muted-foreground">{texts.empty}</p>}
          {!waiting && rows.map((row) => <ActivityRow key={row.person.id} activity={row} top={row.person.id === top} />)}
        </GlassSection>
        <GlassSection>
          <GlassRow icon={Network} tone="red" title={texts.teams} subtitle={texts.teamsLine} href="/teams" />
        </GlassSection>
      </GlassSplit>
    </GlassBody>
  );
}
