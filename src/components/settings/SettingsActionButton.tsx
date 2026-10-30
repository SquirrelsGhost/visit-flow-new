import { Loader2, type LucideIcon } from "lucide-react";
import { ACTION_BUTTON } from "./settingsStyles";

interface SettingsActionButtonProps {
  label: string;
  busyLabel?: string;
  busy?: boolean;
  icon?: LucideIcon;
  onClick: () => void;
}

/** Hauptknopf eines aufgeklappten Formulars (Speichern), mit Ladezustand. */
export default function SettingsActionButton({ label, busyLabel, busy = false, icon: Icon, onClick }: SettingsActionButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={busy} aria-busy={busy} className={ACTION_BUTTON}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : Icon && <Icon className="h-4 w-4" />}
      {busy ? (busyLabel ?? label) : label}
    </button>
  );
}
