import GlassRowText from "../glass/GlassRowText";

interface SettingsRowTextProps {
  title: string;
  subtitle?: string;
  /** Unterzeile als Warnung (z. B. "im Browser blockiert"). */
  warn?: boolean;
}

/** Titel und Unterzeile einer Zeile. */
export default function SettingsRowText(props: SettingsRowTextProps) {
  return <GlassRowText {...props} />;
}
