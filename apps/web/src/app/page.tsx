import { redirect } from "next/navigation";

/** Die Website kommt später. Bis dahin startet die App direkt in der Laufliste (ohne Anmeldung geht es zum Login). */
export default function RootPage() {
  redirect("/dashboard");
}
