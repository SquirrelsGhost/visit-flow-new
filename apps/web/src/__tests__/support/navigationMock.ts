import { useSyncExternalStore } from "react";

/** Kleine Attrappe für next/navigation: eine Adresse im Speicher, die replace/push ändern. */
let current = new URL("http://test/login");
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTestUrl(url: string) {
  current = new URL(url, "http://test");
  listeners.forEach((listener) => listener());
}

const useUrl = () => useSyncExternalStore(subscribe, () => current.href);

export const navigationMock = {
  useRouter: () => ({ replace: setTestUrl, push: setTestUrl, back: () => undefined, refresh: () => undefined }),
  usePathname: () => new URL(useUrl()).pathname,
  useSearchParams: () => new URL(useUrl()).searchParams,
};
