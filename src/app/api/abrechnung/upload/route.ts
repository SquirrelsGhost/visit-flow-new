import { ok, err } from "@/lib/api";
import type { AbrechnungCategory, AbrechnungRecord } from "@/lib/abrechnung/abrechnungTypes";
import { AbrechnungDatabaseService } from "@/services/AbrechnungDatabaseService";
import { getSessionUser } from "@/services/sicherheit/SessionUserService";

interface AbrechnungUploadResponse extends AbrechnungRecord {
  parsedItemCount: number;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await getSessionUser(req);
    if (!user || user.banned) return err("Bitte melde dich an.", 401);
    const form = await req.formData().catch(() => null);
    if (!form) {
      return err("Ungültige Formulardaten (multipart/form-data erwartet).", 400);
    }
    const file = form.get("file") as File | null;
    const month = Number(form.get("month")) || 0;
    const year = Number(form.get("year")) || new Date().getFullYear();
    const category = ((form.get("category") as string) || "vodafone") as AbrechnungCategory;
    const totalRaw = form.get("totalAmountPdf");
    const total = totalRaw !== null ? Number(totalRaw) : undefined;

    const result = await AbrechnungDatabaseService.upload(
      user.id,
      category,
      month,
      year,
      file?.name ?? null,
      total,
    );
    const payload: AbrechnungUploadResponse = {
      ...result.record,
      parsedItemCount: result.parsedItemCount,
    };
    return ok(payload);
  } catch (error) {
    console.error("[POST /api/abrechnung/upload]", error);
    return err("Internal server error");
  }
}
