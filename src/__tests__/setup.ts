import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { setAccessToken } from "../lib/auth/accessToken";

delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

function installBrowserStubs(): void {
  if (typeof window !== "undefined") {
    window.scrollTo = () => {};
    Element.prototype.scrollTo = () => {};
  }
  if (typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }
}

installBrowserStubs();

beforeEach(() => {
  installBrowserStubs();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  setAccessToken(null);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  installBrowserStubs();
});
