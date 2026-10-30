import { getAccessToken } from "../auth/accessToken";
import { refreshAccessToken } from "../apiClient";
import type { AbrechnungCategory, AbrechnungRecord, MonthRef, UploadResult } from "./abrechnungTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class UploadError extends Error {}

interface UploadBody {
  success?: boolean;
  message?: string;
  data?: AbrechnungRecord;
  parsedItemCount?: number;
}

/**
 * Datei-Upload an v1 POST /api/abrechnung/upload. Eigener fetch, weil apiRequest JSON setzt;
 * bei FormData muss der Browser die Grenze (boundary) selbst in den Content-Type schreiben.
 */
export async function uploadBillingFile(category: AbrechnungCategory, ref: MonthRef, file: File | null, total?: number): Promise<UploadResult> {
  const form = new FormData();
  if (file) form.append("file", file);
  form.append("month", String(ref.month));
  form.append("year", String(ref.year));
  form.append("category", category);
  if (total !== undefined) form.append("totalAmountPdf", total.toFixed(2));

  const send = () => {
    const token = getAccessToken();
    return fetch(`${API_URL}/api/abrechnung/upload`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  };

  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && (await refreshAccessToken())) res = await send();
  } catch {
    throw new UploadError("Verbindungsfehler beim Hochladen");
  }
  const body = (await res.json().catch(() => null)) as UploadBody | null;
  if (!res.ok || !body?.success || !body.data) throw new UploadError(body?.message || `Hochladen fehlgeschlagen (${res.status})`);
  return { record: body.data, parsedItemCount: body.parsedItemCount ?? 0 };
}
