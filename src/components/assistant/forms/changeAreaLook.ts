import { FileSignature, Landmark, MapPin, Phone, Receipt, User, type LucideIcon } from "lucide-react";
import type { ChangeArea } from "../../../lib/forms/formTypes";
import type { GlassTone } from "../../../lib/glass/glassTones";

/** Symbol und Farbe je Bereich der Änderungsmitteilung. */
export const CHANGE_AREA_LOOK: Record<ChangeArea, { icon: LucideIcon; tone: GlassTone }> = {
  name: { icon: User, tone: "blue" },
  address: { icon: MapPin, tone: "red" },
  contact: { icon: Phone, tone: "green" },
  bank: { icon: Landmark, tone: "indigo" },
  tax: { icon: Receipt, tone: "amber" },
  other: { icon: FileSignature, tone: "gray" },
};
