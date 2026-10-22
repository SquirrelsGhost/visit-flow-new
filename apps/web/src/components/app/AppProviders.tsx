import type { ReactNode } from "react";
import AuthProvider from "../auth/AuthProvider";
import ConsentBanner from "../consent/ConsentBanner";
import TranslationProvider from "../i18n/TranslationProvider";
import ThemeProvider from "../theme/ThemeProvider";
import MotionProvider from "../ui/MotionProvider";
import Toaster from "../ui/Toaster";

interface AppProvidersProps {
  children: ReactNode;
}

/** Alle Provider der App plus Einwilligungs-Banner und Toasts. Setzt nur zusammen. */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <TranslationProvider>
          <AuthProvider>
            {children}
            <ConsentBanner />
            <Toaster />
          </AuthProvider>
        </TranslationProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
