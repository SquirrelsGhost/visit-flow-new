/** Stand der Browser-Erlaubnis; "unsupported", wenn es keine Benachrichtigungen gibt (z. B. iOS ohne PWA). */
export type PushPermission = NotificationPermission | "unsupported";

export function readPushPermission(): PushPermission {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (readPushPermission() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return readPushPermission();
  }
}

/** Zeigt eine Benachrichtigung, wenn erlaubt (v1 useNotificationSystem.sendNotification). */
export function showNotification(title: string, body: string): void {
  if (readPushPermission() !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    // Manche mobilen Browser erlauben Benachrichtigungen nur über einen Service Worker
  }
}

/** iOS Safari außerhalb der installierten PWA (v1 utils/push.isIosSafari). */
export function isIosSafari(): boolean {
  const agent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(agent) && /Safari/.test(agent) && !/CriOS|FxiOS/.test(agent);
}

export type DeviceKind = "ios" | "android" | "desktop";

export function deviceKind(): DeviceKind {
  const agent = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(agent)) return "ios";
  return /Android/.test(agent) ? "android" : "desktop";
}
