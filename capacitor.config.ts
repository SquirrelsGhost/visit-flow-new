import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Gleiche appId wie v1 (com.visitflow.app): Nur so ersetzt das v2-Build die bestehende App
 * in Play Store und App Store. Beim Signieren denselben Schlüssel wie v1 verwenden.
 */
const config: CapacitorConfig = {
  appId: "com.visitflow.app",
  appName: "Visit Flow",
  webDir: "out",
  server: { androidScheme: "https" },
};

export default config;
