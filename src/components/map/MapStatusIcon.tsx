import { AlertTriangle, CalendarCheck, CheckCircle2, DoorClosed, PlugZap, XCircle } from "lucide-react";
import type { Vertical } from "../../lib/battle/battleCategories";
import type { VisitStatus } from "../../lib/map/mapTypes";

interface MapStatusIconProps {
  status: VisitStatus;
  vertical: Vertical;
  size?: number;
}

/** Symbol zum Besuchs-Status wie in v1 TrackingMap. */
export default function MapStatusIcon({ status, vertical, size = 17 }: MapStatusIconProps) {
  if (status === "Angetroffen → Versorgt" && vertical === "solar") {
    return <AlertTriangle size={size} />;
  }
  switch (status) {
    case "Angetroffen → Termin":
      return <CalendarCheck size={size} />;
    case "Angetroffen → Sale":
    case "Approved":
      return <CheckCircle2 size={size} />;
    case "Angetroffen → Versorgt":
      return <PlugZap size={size} />;
    case "Angetroffen → Kein Interesse":
    case "Storno":
      return <XCircle size={size} />;
    case "N/A":
      return <DoorClosed size={size} />;
  }
}
