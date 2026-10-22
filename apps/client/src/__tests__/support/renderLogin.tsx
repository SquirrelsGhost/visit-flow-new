import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { vi } from "vitest";
import AuthProvider from "../../components/auth/AuthProvider";
import TranslationProvider from "../../components/i18n/TranslationProvider";
import ThemeProvider from "../../components/theme/ThemeProvider";
import LoginPage from "../../pages/LoginPage";

/** Partikel brauchen ein echtes Canvas, das jsdom nicht hat. */
vi.mock("../../components/ui/Sparkles", () => ({ default: () => null }));

function CurrentPath() {
  const location = useLocation();
  return <p data-testid="current-path">{location.pathname}</p>;
}

/** Rendert die Login-Seite mit allen Providern unter der angegebenen Adresse. */
export function renderLogin(url = "/login?tab=login") {
  return render(
    <ThemeProvider>
      <TranslationProvider>
        <MemoryRouter initialEntries={[url]}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding" element={<LoginPage />} />
              <Route path="*" element={<CurrentPath />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
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
