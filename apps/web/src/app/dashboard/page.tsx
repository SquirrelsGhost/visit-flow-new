import type { Metadata } from "next";
import { Suspense } from "react";
import LoginLoading from "../../components/auth/LoginLoading";
import HomePlaceholder from "../../components/home/HomePlaceholder";
import RequireAuth from "../../components/routing/RequireAuth";
import { MetaTagService } from "../../services/MetaTagService";
import { TranslationService } from "../../services/TranslationService";

// This page reads request-time data (cookies/headers) for locale detection.
// instant = false opts it out of prerender validation — rendering is still server-side.
// See: https://nextjs.org/docs/messages/blocking-prerender-runtime
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await TranslationService.GetUserTranslations();
  return MetaTagService.CreateMetaTags(t.DashboardPage.MetaTags);
}

/** Laufliste (/dashboard) hinter der Anmeldung. */
export default function DashboardPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <RequireAuth>
        <HomePlaceholder />
      </RequireAuth>
    </Suspense>
  );
}
