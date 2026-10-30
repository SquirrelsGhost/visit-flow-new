import type { Vertical } from "../../lib/battle/battleCategories";
import type { VisitDetails } from "../../lib/map/mapTypes";
import type { VisitStep } from "../../lib/map/visitSteps";
import MapAppointmentStep from "./steps/MapAppointmentStep";
import MapNoInterestStep from "./steps/MapNoInterestStep";
import MapNotHomeStep from "./steps/MapNotHomeStep";
import MapSuppliedStep from "./steps/MapSuppliedStep";

interface MapDraftStepProps {
  step: Exclude<VisitStep, "sale">;
  vertical: Vertical;
  saving: boolean;
  onBack: () => void;
  onSave: (details: VisitDetails) => void;
}

/** Der Status-Schritt, der im Neues-Haus-Sheet die v1-Dialoge ersetzt (Abschluss: sale/MapSaleStep). */
export default function MapDraftStep({ step, ...props }: MapDraftStepProps) {
  switch (step) {
    case "appointment":
      return <MapAppointmentStep {...props} />;
    case "supplied":
      return <MapSuppliedStep {...props} />;
    case "nointerest":
      return <MapNoInterestStep {...props} />;
    case "nothome":
      return <MapNotHomeStep {...props} />;
  }
}
