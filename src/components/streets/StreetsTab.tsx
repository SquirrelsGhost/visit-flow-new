// Filter, Sheets und Zwischenablage leben im Browser
"use client";

import { Copy, Mail, Map as MapIcon, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStreetList } from "../../hooks/useStreetList";
import { useStreetParam } from "../../hooks/useStreetParam";
import { hasDemoSession } from "../../lib/auth/demoSession";
import type { StreetPeople } from "../../lib/streets/streetApi";
import { buildReportText, filterLabel, reportPayload } from "../../lib/streets/streetReport";
import type { StreetScope } from "../../lib/streets/streetScope";
import { sendStreetReport } from "../../lib/streets/streetApi";
import { sameStreet } from "../../lib/streets/streetLinks";
import { fill } from "../../texts/profileTexts";
import { streetListTexts } from "../../texts/streetListTexts";
import GlassBody from "../glass/GlassBody";
import GlassSplit from "../glass/GlassSplit";
import GlassQuickAction from "../glass/GlassQuickAction";
import OrgActions from "../teams/OrgActions";
import StreetDetailSheet, { type StreetDetail } from "./StreetDetailSheet";
import StreetFilters from "./StreetFilters";
import StreetHero from "./StreetHero";
import StreetPlaces from "./StreetPlaces";
import StreetSheets from "./StreetSheets";

interface StreetsTabProps {
  scope: StreetScope;
  people: StreetPeople | null | undefined;
}

const texts = streetListTexts;

/** Reiter Straßen: Kopfkarte mit Zahlen, Schnellknöpfe, Zeitraum und Suche, darunter die Straßen nach Ort. ?strasse= öffnet eine Straße. */
export default function StreetsTab({ scope, people }: StreetsTabProps) {
  const router = useRouter();
  const link = useStreetParam();
  const [target, setTarget] = useState(link.street);
  const list = useStreetList(scope, people, link.street);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [detail, setDetail] = useState<StreetDetail | null>(null);
  const empty = list.rows.length === 0;
  const [linked, setLinked] = useState<{ missing: string | null } | null>(null);
  const clearLink = link.clear;

  // Aus dem CRM verlinkt: sobald Türen und Personen da sind, einmal das Straßen-Sheet öffnen.
  if (target && list.data !== undefined && people !== undefined) {
    const row = list.allRows.find((r) => sameStreet(r, target));
    setTarget(null);
    if (row) {
      list.setQuery(row.street);
      setOpenKey(row.key);
    }
    setLinked({ missing: row || !list.data ? null : target.street });
  }
  useEffect(() => {
    if (!linked) return;
    if (linked.missing) toast.info(fill(texts.links.notFound, { street: linked.missing }));
    clearLink();
  }, [linked, clearLink]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText(list.rows, list.filter));
      toast.success(texts.report.copied);
    } catch {
      toast.error(texts.report.copyFailed);
    }
  };
  const mail = async () => {
    const ok = await sendStreetReport(reportPayload(list.rows, list.stats, list.filter));
    if (!ok) return void toast.error(texts.report.sendFailed);
    toast.success(hasDemoSession() ? texts.report.demoSent : texts.report.sent);
  };

  return (
    <GlassBody layout="wide">
      <GlassSplit
        sticky
        aside={
          <>
            <StreetHero scope={scope} people={people} stats={list.stats} streets={list.rows.length} period={filterLabel(list.filter)} loading={list.loading} onDetail={setDetail} />
            <OrgActions>
              <GlassQuickAction icon={Copy} label={texts.actions.copy} onClick={() => void copy()} disabled={empty} />
              {scope.canManage && <GlassQuickAction icon={Mail} label={texts.actions.mail} onClick={() => void mail()} disabled={empty} />}
              <GlassQuickAction icon={MapIcon} label={texts.actions.map} onClick={() => router.push("/dashboard")} />
              <GlassQuickAction icon={Network} label={texts.actions.teams} onClick={() => router.push("/teams")} />
            </OrgActions>
            <StreetFilters list={list} groups={scope.groups} />
          </>
        }
      >
        <StreetPlaces places={list.places} hasData={list.allRows.length > 0} loading={list.data === undefined} failed={list.data === null} manage={scope.canManage} onOpen={setOpenKey} />
      </GlassSplit>
      <StreetSheets scope={scope} people={people} rows={list.rows} openKey={openKey} onClose={() => setOpenKey(null)} onChanged={list.reload} />
      <StreetDetailSheet detail={detail} stats={list.stats} onClose={() => setDetail(null)} />
    </GlassBody>
  );
}
