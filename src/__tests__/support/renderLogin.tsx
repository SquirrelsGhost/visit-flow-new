import { render } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { vi } from "vitest";
import AuthProvider from "../../components/auth/AuthProvider";
import LoginScreen from "../../components/auth/LoginScreen";
import TranslationProvider from "../../components/i18n/TranslationProvider";
import ThemeProvider from "../../components/theme/ThemeProvider";
import { setTestUrl } from "./navigationMock";

vi.mock("next/navigation", async () => (await import("./navigationMock")).navigationMock);
/** Partikel brauchen ein echtes Canvas, das jsdom nicht hat. */
vi.mock("../../components/ui/Sparkles", () => ({ default: () => null }));

const LOGIN_PATHS = ["/login", "/onboarding"];

/** Zeigt wie der App Router die Login-Seite unter /login und /onboarding, sonst nur die Adresse. */
function TestRoutes() {
  const pathname = usePathname();
  if (LOGIN_PATHS.includes(pathname)) return <LoginScreen />;
  return <p data-testid="current-path">{pathname}</p>;
}

/** Rendert die Login-Seite mit allen Providern unter der angegebenen Adresse. */
export function renderLogin(url = "/login?tab=login") {
  setTestUrl(url);
  return render(
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <TestRoutes />
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>,
  );
}


/** fetch-Attrappe: antwortet je Pfad mit Status und Body. */
export function mockApi(routes: Record<string, { status: number; body: unknown }>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = String(input).replace(/^.*\/api/, "");
    const route = routes[path] ?? { status: 404, body: { success: false, error: "nicht gefunden", message: "nicht gefunden" } };
    return new Response(JSON.stringify(route.body), { status: route.status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export const LOGIN_OK = {
  status: 200,
  body: {
    success: true,
    data: {
      user: { id: "u1", email: "test@example.com", role: "berater", name: "Test Berater" },
      token: "jwt",
      showTeamLeiterLiveTracking: false,
    },
  },
};
