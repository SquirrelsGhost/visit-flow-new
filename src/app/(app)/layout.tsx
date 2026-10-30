import { Suspense, type ReactNode } from "react";
import LoginLoading from "../../components/auth/LoginLoading";
import AppShell from "../../components/layout/AppShell";
import RequireAuth from "../../components/routing/RequireAuth";

interface AppLayoutProps {
  children: ReactNode;
}

/** Alle Seiten nach dem Login: nur angemeldet, im Rahmen mit Topbar und unterer Navigation. */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <RequireAuth>
        <AppShell>{children}</AppShell>
      </RequireAuth>
    </Suspense>
  );
}
