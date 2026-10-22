import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { setAccessToken } from "../lib/auth/accessToken";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  setAccessToken(null);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
