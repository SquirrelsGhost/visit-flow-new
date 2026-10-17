import ConsentBanner from "../components/consent/ConsentBanner";
import AppFooter from "../components/layout/AppFooter";
import FoundationNotice from "../components/layout/FoundationNotice";

/** Wurzel der App. Setzt nur Komponenten zusammen. */
export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <FoundationNotice />
      <AppFooter />
      <ConsentBanner />
    </div>
  );
}
