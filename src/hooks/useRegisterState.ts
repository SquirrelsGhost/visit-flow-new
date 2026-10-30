import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { RegisterStep } from "../lib/register/registerSteps";

/** Gleicher Schlüssel wie v1: Safari lädt Tabs gern neu, die Eingaben sollen das überstehen. */
const STORAGE_KEY = "vf_registration_state";

export interface SavedRegistration {
  step: RegisterStep;
  name: string;
  email: string;
  vpkn: string;
  verificationCode: string;
  secondaryEmail: string;
  secondaryVerificationCode: string;
  selectedTeamId: string;
  contractStart: string;
}

const EMPTY: SavedRegistration = {
  step: "data",
  name: "",
  email: "",
  vpkn: "",
  verificationCode: "",
  secondaryEmail: "",
  secondaryVerificationCode: "",
  selectedTeamId: "",
  contractStart: "",
};

function load(): SavedRegistration {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    return saved ? { ...EMPTY, ...(JSON.parse(saved) as Partial<SavedRegistration>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function clearSavedRegistration(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ohne sessionStorage gibt es nichts zu löschen
  }
}

/** Formularwerte der Registrierung, im Tab gespeichert. Ein Einladungslink (?team=…) wählt das Team vor. */
export function useRegisterState() {
  const urlTeam = useSearchParams().get("team") ?? "";
  const [state, setState] = useState<SavedRegistration>(() => {
    const saved = load();
    return urlTeam ? { ...saved, selectedTeamId: urlTeam } : saved;
  });
  // Passwörter werden bewusst nie gespeichert
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Speicher voll oder privater Modus: dann gilt der Stand nur bis zum Neuladen
    }
  }, [state]);

  const update = <K extends keyof SavedRegistration>(key: K, value: SavedRegistration[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  return { state, update, password, setPassword, confirmPassword, setConfirmPassword };
}
