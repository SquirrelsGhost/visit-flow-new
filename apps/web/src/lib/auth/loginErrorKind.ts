export type LoginErrorKind = "ipBlocked" | "rateLimit" | "network" | "generic";

/** Ordnet eine Fehlermeldung wie v1 anhand ihres Textes einer Darstellung zu. */
export function loginErrorKind(message: string): LoginErrorKind {
  if (message.includes("IP-Adresse") && message.includes("gesperrt")) return "ipBlocked";
  if (message.includes("Zu viele") || message.includes("Too many")) return "rateLimit";
  const network = ["Verbindung", "Timeout", "Zeitüberschreitung", "Failed to fetch"];
  if (network.some((part) => message.includes(part))) return "network";
  return "generic";
}
