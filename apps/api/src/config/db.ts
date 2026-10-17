import mongoose from "mongoose";

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30_000,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
};

const RETRY_DELAY_MS = 10_000;
let retryTimer: NodeJS.Timeout | null = null;

function scheduleReconnect(uri: string): void {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    const state = mongoose.connection.readyState;
    if (state === mongoose.ConnectionStates.connected || state === mongoose.ConnectionStates.connecting) return;
    mongoose.connect(uri, CONNECT_OPTIONS).catch((error: Error) => {
      console.error("[MongoDB] Neuer Verbindungsversuch fehlgeschlagen:", error.message);
      scheduleReconnect(uri);
    });
  }, RETRY_DELAY_MS);
  retryTimer.unref();
}

/**
 * Verbindet mit MongoDB und heilt sich selbst: Schlägt der erste Versuch fehl oder bricht die
 * Verbindung ganz ab, wird im Hintergrund weiter versucht, statt den Prozess hängen zu lassen.
 * (Übernommen aus v1, Stabilitäts-Audit vom 01.07.2026.)
 */
export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("disconnected", () => console.error("[MongoDB] Verbindung getrennt"));
  mongoose.connection.on("reconnected", () => console.info("[MongoDB] Wieder verbunden"));
  mongoose.connection.on("close", () => scheduleReconnect(uri));
  try {
    await mongoose.connect(uri, CONNECT_OPTIONS);
    console.info("[MongoDB] Verbunden");
  } catch (error) {
    console.error("[MongoDB] Erste Verbindung fehlgeschlagen:", (error as Error).message);
    scheduleReconnect(uri);
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (retryTimer) clearTimeout(retryTimer);
  await mongoose.disconnect();
}
