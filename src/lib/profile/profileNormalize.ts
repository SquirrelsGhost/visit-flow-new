import type { Invoice, InvoiceStatus, Subscription, SubscriptionStatus } from "./profileTypes";

type Raw = Record<string, unknown>;

const SUB_STATUS: readonly SubscriptionStatus[] = ["active", "incomplete", "canceled"];
const INVOICE_STATUS: readonly InvoiceStatus[] = ["paid", "open", "void", "draft", "uncollectible"];

const isRaw = (value: unknown): value is Raw => typeof value === "object" && value !== null;
const str = (value: unknown) => (typeof value === "string" ? value : undefined);

/** Abo aus GET /subscriptions/current (v1); unbekannter Status gilt als inaktiv. */
export function normalizeSubscription(data: unknown): Subscription | null {
  if (!isRaw(data)) return null;
  const status = SUB_STATUS.find((s) => s === data.status) ?? "inactive";
  const features = Array.isArray(data.features) ? data.features.filter((f): f is string => typeof f === "string") : [];
  const total = Number(data.licenseCount ?? data.quantity);
  const used = Number(data.usedLicenses ?? data.assignedLicenses);
  const licenses = total > 0 ? { total, used: Number.isFinite(used) ? Math.min(used, total) : 0 } : undefined;
  const renewsAt = str(data.currentPeriodEnd) ?? str(data.nextBillingDate);
  return { planId: str(data.planId) ?? "basic", status, price: Number(data.price) || 0, features, licenses, renewsAt };
}

/** Rechnungen aus POST /invoices/sync (v1, Stripe): Datum = bezahlt am, sonst erstellt am. */
export function normalizeInvoices(data: unknown): Invoice[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isRaw).map((raw, index) => ({
    id: str(raw._id) ?? str(raw.id) ?? String(index),
    status: INVOICE_STATUS.find((s) => s === raw.status) ?? "draft",
    date: str(raw.paidAt) ?? str(raw.createdAt) ?? "",
    amount: Number(raw.amount) || 0,
    description: str(raw.description),
    url: str(raw.invoiceUrl) ?? str(raw.invoicePdf),
  }));
}
