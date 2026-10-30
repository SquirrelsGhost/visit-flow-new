import { resolveMapboxToken } from "./mapStyles";
import type { AddressSuggestion } from "./mapTypes";

interface PhotonFeature {
  properties?: {
    street?: string;
    name?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

interface MapboxFeature {
  text?: string;
  address?: string;
  center?: [number, number];
  context?: { id?: string; text?: string }[];
}

export async function fetchAddressSuggestions(
  query: string,
  center: { lng: number; lat: number } | null,
  signal: AbortSignal,
): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const bias = center ? `&lat=${center.lat}&lon=${center.lng}` : "";
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=de&limit=6${bias}`, {
      signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: PhotonFeature[] };
    return (data.features ?? [])
      .map((f) => {
        const p = f.properties ?? {};
        const line1 = [p.street || p.name, p.housenumber].filter(Boolean).join(" ");
        const line2 = [p.postcode, p.city].filter(Boolean).join(" ");
        const label = [line1, line2].filter(Boolean).join(", ") || p.name || q;
        const coords = f.geometry?.coordinates;
        return { label, lng: coords?.[0] ?? NaN, lat: coords?.[1] ?? NaN };
      })
      .filter((s) => Number.isFinite(s.lng) && Number.isFinite(s.lat));
  } catch {
    return [];
  }
}

export async function geocodeAddressQuery(query: string): Promise<{ lng: number; lat: number } | null> {
  const token = resolveMapboxToken();
  if (token) {
    try {
      const rawUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        `${query}, Deutschland`,
      )}.json?access_token=${token}&country=de&language=de&limit=1`;
      const url = `/api/mapbox?url=${encodeURIComponent(rawUrl)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as { features?: MapboxFeature[] };
        const coords = data.features?.[0]?.center;
        if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
          return { lng: coords[0], lat: coords[1] };
        }
      }
    } catch {
      // Fallback zu Photon
    }
  }
  const ctrl = new AbortController();
  const list = await fetchAddressSuggestions(query, null, ctrl.signal);
  return list[0] ? { lng: list[0].lng, lat: list[0].lat } : null;
}

export async function reverseGeocodePoint(
  lng: number,
  lat: number,
): Promise<{ street: string; houseNumber: string; zipCode: string; city: string }> {
  const token = resolveMapboxToken();
  if (token) {
    try {
      const rawUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address&language=de&limit=1`;
      const url = `/api/mapbox?url=${encodeURIComponent(rawUrl)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as { features?: MapboxFeature[] };
        const feat = data.features?.[0];
        if (feat) {
          const ctx = feat.context ?? [];
          const postcode = ctx.find((c) => c.id?.startsWith("postcode"))?.text ?? "";
          const place =
            ctx.find((c) => c.id?.startsWith("place"))?.text ??
            ctx.find((c) => c.id?.startsWith("locality"))?.text ??
            "";
          return {
            street: feat.text ?? "",
            houseNumber: feat.address ?? "",
            zipCode: postcode,
            city: place,
          };
        }
      }
    } catch {
      // Fallback zu Photon Reverse
    }
  }
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=de`);
    if (res.ok) {
      const data = (await res.json()) as { features?: PhotonFeature[] };
      const p = data.features?.[0]?.properties;
      if (p) {
        return {
          street: p.street || p.name || "",
          houseNumber: p.housenumber ?? "",
          zipCode: p.postcode ?? "",
          city: p.city ?? "",
        };
      }
    }
  } catch {
    // Keine Verbindung
  }
  return { street: "", houseNumber: "", zipCode: "", city: "" };
}
