import { MAPBOX_TOKEN } from "../map/mapStyles";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface GeocodeResponse {
  features?: { center?: [number, number] }[];
}

/**
 * Koordinaten zu einer Adresse in Deutschland (v1 GeocodingService über Mapbox).
 * Ohne Schlüssel oder Netz kommt null; die Adresse wird dann ohne Koordinaten gespeichert wie in v1.
 */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  if (!MAPBOX_TOKEN) return null;
  const query = encodeURIComponent(`${address}, Deutschland`);
  try {
    const response = await fetch(`${GEOCODE_URL}/${query}.json?country=de&limit=1&language=de&access_token=${MAPBOX_TOKEN}`);
    if (!response.ok) return null;
    const center = ((await response.json()) as GeocodeResponse).features?.[0]?.center;
    return center ? { longitude: center[0], latitude: center[1] } : null;
  } catch {
    return null;
  }
}
