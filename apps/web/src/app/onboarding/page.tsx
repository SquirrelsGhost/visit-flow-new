import type { Metadata } from "next";
import { Suspense } from "react";
import AuthErrorBoundary from "../../components/auth/AuthErrorBoundary";
import LoginLoading from "../../components/auth/LoginLoading";
import LoginScreen from "../../components/auth/LoginScreen";
import { MetaTagService } from "../../services/MetaTagService";
import { TranslationService } from "../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.LoginPage.MetaTags);
}

/** Onboarding-Link aus v1: dieselbe Anmeldeseite, Reiter "Eigenes Team buchen". Der Reiter kommt aus der Adresse, deshalb hinter Suspense. */
export default function OnboardingPage() {
  return (
    <AuthErrorBoundary>
      <Suspense fallback={<LoginLoading />}>
        <LoginScreen />
      </Suspense>
    </AuthErrorBoundary>
  );
}
