import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AssistantView from "../components/assistant/AssistantView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Assistent in der Sparte Energie", () => {
  it("zeigt im KI-Reiter Energie-Wissen und die Checkliste statt Vodafone-Hotline", async () => {
    window.localStorage.setItem("activeVertical", "energy");
    render(<AssistantView />);
    fireEvent.click(screen.getByRole("tab", { name: /KI/ }));
    const panel = screen.getByRole("tabpanel", { name: /KI/ });
    expect(within(panel).getByText("Netzbetreiber")).toBeInTheDocument();
    expect(within(panel).getByText("Nummer wird gerade hinterlegt")).toBeInTheDocument();
    expect(within(panel).queryByText("01721217212")).not.toBeInTheDocument();
    expect(await within(panel).findByRole("button", { name: /pleitegeht/ })).toBeInTheDocument();
  });
});
