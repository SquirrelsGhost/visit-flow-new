import { eq } from "drizzle-orm";
import { users } from "../../../modules/users/User.model";
import { chunk, inBatches } from "../convert";
import type { StepContext } from "../context";
import { convertUser, type ConvertedUser } from "./convertUser";

/** Behält pro E-Mail das zuletzt aktive Konto und pro Empfehlungscode den ersten. */
function dedupe(ctx: StepContext, all: ConvertedUser[]): ConvertedUser[] {
  const byEmail = new Map<string, ConvertedUser>();
  for (const user of all) {
    const existing = byEmail.get(user.row.email);
    if (existing) {
      const keepNew = (user.row.lastActivityAt?.getTime() ?? 0) > (existing.row.lastActivityAt?.getTime() ?? 0);
      ctx.report.warn("Doppelte E-Mail, älteres Konto übersprungen", keepNew ? existing.v1Id : user.v1Id);
      if (!keepNew) continue;
    }
    byEmail.set(user.row.email, user);
  }
  const codes = new Set<string>();
  for (const user of byEmail.values()) {
    const code = user.row.referralCode;
    if (!code) continue;
    if (codes.has(code)) {
      ctx.report.warn("Doppelter Empfehlungscode entfernt", user.v1Id);
      user.row.referralCode = null;
    }
    codes.add(code);
  }
  return [...byEmail.values()];
}

/** Schritt 1: Nutzer, noch ohne Verweise auf Teams oder andere Nutzer. */
export async function migrateUsers(ctx: StepContext): Promise<void> {
  const converted: ConvertedUser[] = [];
  for await (const batch of inBatches(ctx.source.read("users"))) {
    for (const doc of batch) {
      const user = convertUser(doc, ctx.report, ctx.now);
      if (user) converted.push(user);
    }
  }
  const rows = dedupe(ctx, converted).map((user) => {
    const id = ctx.ids.assign("users", user.v1Id, user.row.createdAt ?? ctx.now);
    ctx.userRefs.set(id, user.refs);
    return { ...user.row, id };
  });
  for (const part of chunk(rows)) await ctx.tx.insert(users).values(part);
  ctx.report.count("users", rows.length);
}

/** Letzter Nutzer-Schritt: Team, Mentor, Strukturleiter und Werber setzen, sobald alle Ziele existieren. */
export async function linkUsers(ctx: StepContext): Promise<void> {
  for (const [userId, refs] of ctx.userRefs) {
    const resolve = (collection: string, v1Id: string | null, kind: string) => {
      const id = ctx.ids.get(collection, v1Id);
      if (v1Id && !id) ctx.report.warn(`Verweis auf fehlende(n) ${kind} entfernt`, userId);
      return id;
    };
    let teamId = refs.teamId === "none" ? null : resolve("teams", refs.teamId, "Team");
    const memberTeams = ctx.memberOf.get(userId) ?? [];
    if (!teamId && memberTeams.length === 1) teamId = memberTeams[0] ?? null;
    const link = {
      teamId,
      mentorId: resolve("users", refs.mentorId, "Mentor"),
      strukturleiterId: resolve("users", refs.strukturleiterId, "Strukturleiter"),
      referredById: resolve("users", refs.referredById, "Werber"),
    };
    if (Object.values(link).every((value) => value === null)) continue;
    await ctx.tx.update(users).set(link).where(eq(users.id, userId));
  }
}
