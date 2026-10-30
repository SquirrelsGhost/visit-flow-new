import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AssistantView from "../components/assistant/AssistantView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Seite Assistent", () => {
  it("öffnet wie v1 den Reiter 'Ich' und zeigt ohne Daten einen Hinweis", async () => {
    render(<AssistantView />);
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Ich");
    expect(await screen.findByText(/sobald Besuche und Aufträge/)).toBeInTheDocument();
  });

  it("durchsucht im Reiter KI die Wissensdatenbank und klappt Einträge auf", async () => {
    render(<AssistantView />);
    fireEvent.click(screen.getByRole("tab", { name: /KI/ }));
    const panel = screen.getByRole("tabpanel", { name: /KI/ });
    fireEvent.change(within(panel).getByPlaceholderText(/Suche nach Themen/), { target: { value: "zu teuer" } });
    const entry = await within(panel).findByRole("button", { name: /zu teuer/i });
    fireEvent.click(entry);
    expect(entry).toHaveAttribute("aria-expanded", "true");
  });

  it("merkt sich den gewählten Reiter im Tab", () => {
    render(<AssistantView />);
    fireEvent.click(screen.getByRole("tab", { name: /D2D/ }));
    expect(window.sessionStorage.getItem("smart_visit_assistant_tab")).toBe("tracker");
    expect(screen.getByText("D2D Center")).toBeInTheDocument();
  });
});
