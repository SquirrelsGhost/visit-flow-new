import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";
import { MapboxProxyService } from "@/services/MapboxProxyService";

interface MapboxProxyStatusResponse {
  proxied: boolean;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    if (!targetUrl) {
      const data: MapboxProxyStatusResponse = { proxied: true };
      return ok(data);
    }

    const proxiedResponse = await MapboxProxyService.proxyTileOrStyle(targetUrl);
    if (!proxiedResponse) {
      return err("Ungültige Mapbox-Zieladresse", 400);
    }
    return proxiedResponse;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/mapbox]", error);
    return err("Internal server error");
  }
}
