import type { ReactNode } from "react";
import { GLASS_FOOTER, GLASS_LABEL } from "../../glass/glassStyles";
import { FORM_CARD, FORM_GRID } from "./formStyles";

interface FormCardProps {
  label: string;
  /** Erklärung unter der Karte. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Abschnitt eines Formulars: leise Überschrift, darunter eine Glaskarte mit zweispaltigem Feldraster.
 * In einem Kartenpaar wächst die Karte auf Zeilenhöhe, die Felder bleiben oben.
 */
export default function FormCard({ label, footer, children }: FormCardProps) {
  return (
    <section className="flex min-w-0 flex-col">
      <h3 className={GLASS_LABEL}>{label}</h3>
      <div className={`${FORM_CARD} ${FORM_GRID} flex-1 content-start`}>{children}</div>
      {footer && <p className={GLASS_FOOTER}>{footer}</p>}
    </section>
  );
}
