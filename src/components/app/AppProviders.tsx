import type { ReactNode } from "react";
import AuthProvider from "../auth/AuthProvider";
import ConsentBanner from "../consent/ConsentBanner";
import FeedbackBridge from "../feedback/FeedbackBridge";
import TranslationProvider from "../i18n/TranslationProvider";
import VfShield from "../security/shield/VfShield";
import ThemeProvider from "../theme/ThemeProvider";
import MotionProvider from "../ui/MotionProvider";
import Toaster from "../ui/Toaster";

interface AppProvidersProps {
  children: ReactNode;
}

/** Alle Provider der App plus Einwilligungs-Banner, Toasts und Feedback (Sounds, Haptik, Konfetti). Setzt nur zusammen. */
export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <TranslationProvider>
          <AuthProvider>
            {children}
            <VfShield />
            <ConsentBanner />
            <Toaster />
            <FeedbackBridge />
          </AuthProvider>
        </TranslationProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}
