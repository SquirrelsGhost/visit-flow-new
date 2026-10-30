import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConsentBanner from "../components/consent/ConsentBanner";
import ExternalContent from "../components/consent/ExternalContent";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")));
});

const renderWithContent = () =>
  render(
    <>
      <ExternalContent>
        <p>Externes Video</p>
      </ExternalContent>
      <ConsentBanner />
    </>,
  );

describe("ExternalContent", () => {
  it("lädt nichts ohne Einwilligung", () => {
    renderWithContent();
    expect(screen.queryByText("Externes Video")).not.toBeInTheDocument();
  });

  it("lädt einmalig, ohne die Einwilligung zu speichern", async () => {
    renderWithContent();
    await userEvent.click(screen.getByRole("button", { name: "Diesen Inhalt laden" }));
    expect(screen.getByText("Externes Video")).toBeInTheDocument();
    expect(window.localStorage.getItem("vf_consent")).toBeNull();
  });

  it("verschwindet sofort, wenn die Einwilligung widerrufen wird", async () => {
    renderWithContent();
    await userEvent.click(screen.getByRole("button", { name: "Alle akzeptieren" }));
    expect(screen.getByText("Externes Video")).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("vf:consent-open")));
    await userEvent.click(screen.getAllByRole("button", { name: "Ablehnen" })[0]!);
    expect(screen.queryByText("Externes Video")).not.toBeInTheDocument();
  });
});
