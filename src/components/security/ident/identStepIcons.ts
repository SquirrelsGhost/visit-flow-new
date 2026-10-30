import { Camera, Handshake, IdCard, Video, type LucideIcon } from "lucide-react";

/** Symbol je Schritt (Ausweisdaten, Scan, Live-Video, Bürgschaft), gleiche Reihenfolge wie identWizardTexts.steps. */
export const IDENT_STEP_ICONS: readonly LucideIcon[] = [IdCard, Camera, Video, Handshake];
