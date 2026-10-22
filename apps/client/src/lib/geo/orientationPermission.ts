type PermissionRequester = { requestPermission?: () => Promise<"granted" | "denied" | "default"> };

/** iOS 13+ fragt vor dem Kompass um Erlaubnis, andere Systeme brauchen das nicht. */
export async function requestOrientationPermission(): Promise<boolean> {
  const orientation = globalThis.DeviceOrientationEvent as unknown as PermissionRequester | undefined;
  if (typeof orientation?.requestPermission !== "function") return true;
  try {
    return (await orientation.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
