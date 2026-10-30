import { render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StreetListView from "../components/streets/StreetListView";
import { setTestUrl } from "./support/navigationMock";

vi.mock("../lib/auth/demoSession", async (importOriginal) => ({ ...(await importOriginal<object>()), hasDemoSession: () => true }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "a1", email: "admin@demo.local", role: "admin" } }) }));
vi.mock("next/navigation", async () => (await import("./support/navigationMock")).navigationMock);
vi.mock("next/link", () => ({
  default: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...rest} />,
}));

describe("Straßenliste ↔ CRM", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("öffnet die Straße aus dem CRM und verlinkt von dort auf ihre Verkäufe", async () => {
    setTestUrl("/admin-street-list?strasse=Oststra%C3%9Fe&plz=40210&ort=D%C3%BCsseldorf");
    render(<StreetListView view="admin" />);
    const sheet = await screen.findByRole("dialog", {}, { timeout: 3000 });
    expect(sheet).toHaveTextContent("Oststraße");
    expect(within(sheet).getByRole("link", { name: "Verkäufe dieser Straße öffnen" })).toHaveAttribute(
      "href",
      "/admin-crm-overview?strasse=Oststra%C3%9Fe&plz=40210&ort=D%C3%BCsseldorf",
    );
  });
});
