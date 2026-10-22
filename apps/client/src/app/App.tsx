import { BrowserRouter } from "react-router";
import AuthProvider from "../components/auth/AuthProvider";
import ConsentBanner from "../components/consent/ConsentBanner";
import TranslationProvider from "../components/i18n/TranslationProvider";
import ThemeProvider from "../components/theme/ThemeProvider";
import Toaster from "../components/ui/Toaster";
import AppRoutes from "./AppRoutes";

/** Wurzel der App. Setzt nur Komponenten zusammen. */
export default function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <ConsentBanner />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </TranslationProvider>
    </ThemeProvider>
  );
}
