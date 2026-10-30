import { useState, type FormEvent, type ReactNode } from "react";
import { GLASS_FIELD } from "../../glass/glassStyles";
import FormError from "../../profile/FormError";
import SheetButton from "./SheetButton";

interface EmailFormProps {
  label: string;
  confirmLabel: string;
  busyLabel: string;
  busy: boolean;
  initial?: string;
  /** Fehlertext oder null, wenn die Adresse passt. */
  validate: (email: string) => string | null;
  onSubmit: (email: string) => Promise<boolean>;
  /** Hinweis über dem Knopf (z. B. Kosten einer zusätzlichen Lizenz). */
  hint?: ReactNode;
}

/** E-Mail eingeben, prüfen und abschicken; Enter schickt ab, der Fehler steht direkt darunter. */
export default function EmailForm({ label, confirmLabel, busyLabel, busy, initial = "", validate, onSubmit, hint }: EmailFormProps) {
  const [email, setEmail] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = validate(email);
    setError(problem);
    if (problem) return;
    if (await onSubmit(email)) setEmail("");
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <input
        type="email"
        inputMode="email"
        autoComplete="off"
        autoFocus
        aria-label={label}
        placeholder={label}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        className={GLASS_FIELD}
      />
      <FormError message={error} />
      {hint}
      <SheetButton type="submit" label={confirmLabel} busyLabel={busyLabel} busy={busy} />
    </form>
  );
}
