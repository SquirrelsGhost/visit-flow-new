import HomePlaceholder from "../components/home/HomePlaceholder";
import RequireAuth from "../components/routing/RequireAuth";

/** Dashboard (/dashboard). Bis zur Portierung ein Platzhalter hinter der Anmeldung. */
export default function HomePage() {
  return (
    <RequireAuth>
      <HomePlaceholder />
    </RequireAuth>
  );
}
