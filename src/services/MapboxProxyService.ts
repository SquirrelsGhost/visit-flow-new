const ALLOWED_HOSTS = new Set(["api.mapbox.com", "events.mapbox.com"]);
const ALLOWED_REFERER = "https://visit-flow.com/";
const ALLOWED_ORIGIN = "https://visit-flow.com";

export class MapboxProxyService {
  /**
   * Leitet Karten-Anfragen (Stile, Satelliten-Kacheln, Vektor-Kacheln, Schriften)
   * mit dem in Mapbox freigeschalteten Referer (https://visit-flow.com/) weiter,
   * damit der Mapbox-Schlüssel auch auf localhost:3000 / :3001 ohne 403 lädt.
   */
  public static async proxyTileOrStyle(targetUrl: string): Promise<Response | null> {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return null;
    }
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
      return null;
    }

    const upstream = await fetch(parsed.toString(), {
      headers: {
        Referer: ALLOWED_REFERER,
        Origin: ALLOWED_ORIGIN,
      },
    });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) headers.set("Cache-Control", cacheControl);

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  }
}
