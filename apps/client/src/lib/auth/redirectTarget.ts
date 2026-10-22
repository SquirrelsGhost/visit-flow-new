interface FromState {
  from?: { pathname?: string; search?: string; hash?: string };
}

/** Ziel nach dem Login: die Seite, die vorher geschützt war, sonst das Dashboard (wie v1). */
export function redirectTarget(state: unknown): string {
  const from = (state as FromState | null)?.from;
  if (!from?.pathname || !from.pathname.startsWith("/") || from.pathname.startsWith("//")) return "/dashboard";
  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}
