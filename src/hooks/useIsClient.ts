import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/** true erst im Browser. Für Teile, die localStorage brauchen und sonst beim Hydrieren abweichen würden. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}
