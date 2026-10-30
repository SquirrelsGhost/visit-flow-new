import { unstable_rethrow } from "next/navigation";
import { ok, err } from "@/lib/api";

/**
 * GET /api/health
 *
 * Returns the current server status and timestamp.
 * Use this as a reference for how all API routes should be structured:
 *
 *  1. One file per resource: src/app/api/[resource]/route.ts
 *  2. Named export per HTTP verb: GET, POST, PUT, DELETE
 *  3. Route handler is a thin layer — call a service for real logic
 *  4. Always return ok() or err() from @/lib/api — never a raw object
 *  5. Define the response shape as a type in this file (or src/types/)
 */

interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
}

export async function GET(req: Request): Promise<Response> {
  try {
    void req.headers.get("accept");
    const data: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.0.0",
    };

    return ok(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/health]", error);
    return err("Internal server error");
  }
}
