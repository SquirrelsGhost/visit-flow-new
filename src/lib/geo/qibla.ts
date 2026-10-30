/** Kaaba in Mekka */
const MECCA = { latitude: 21.4225, longitude: 39.8262 };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Anfangskurs (Großkreis) von einem Punkt zum anderen, 0–360° ab Norden im Uhrzeigersinn. */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function qiblaDirection(latitude: number, longitude: number): number {
  return bearing(latitude, longitude, MECCA.latitude, MECCA.longitude);
}

/** Himmelsrichtung in acht Schritten, wie v1 getCardinalDirection. */
export function cardinalDirection(degrees: number, language: "de" | "en" = "de"): string {
  const directions =
    language === "de" ? ["N", "NO", "O", "SO", "S", "SW", "W", "NW"] : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8] ?? "N";
}

/** Kompassrichtung des Geräts aus einem Orientierungs-Ereignis (iOS liefert sie direkt). */
export function headingFromOrientation(event: DeviceOrientationEvent & { webkitCompassHeading?: number }): number {
  let heading = 0;
  if (event.webkitCompassHeading !== undefined) heading = event.webkitCompassHeading;
  else if (event.alpha !== null) heading = 360 - event.alpha;
  return (heading + 360) % 360;
}
