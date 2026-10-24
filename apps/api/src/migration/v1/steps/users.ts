import { eq } from "drizzle-orm";
import { users } from "../../../modules/users/User.model";
import { inBatches } from "../convert";
import type { StepContext } from "../context";
import { convertUser, type ConvertedUser } from "./convertUser";

/** Schritt 1: Nutzer ohne Verweise. Doppelte E-Mails (nach Kleinschreibung) behalten den zuletzt aktiven. */
export async function migrateUsers(ctx: StepContext): Promise<void> {
  const byEmail = new Map<string, ConvertedUser>();
  for await (const batch of inBatches(ctx.source.read("users"))) {
    for (const doc of batch) {
      const user = convertUser(doc, ctx.report, ctx.now);
      if (!user) continue;
      const existing = byEmail.get(user.row.email);
      if (existing) {
        const keepNew = (user.row.lastActivity?.getTime() ?? 0) > (existing.row.lastActivity?.getTime() ?? 0);
        ctx.report.warn("Doppelte E-Mail, älteres Konto übersprungen", keepNew ? existing.row.id : user.row.id);
        if (!keepNew) continue;
      }
      byEmail.set(user.row.email, user);
    }
  }
  const all = [...byEmail.values()];
  for (let i = 0; i < all.length; i += 500) {
    const slice = all.slice(i, i + 500);
    await ctx.tx.insert(users).values(slice.map((user) => user.row));
    ctx.report.count("users", slice.length);
  }
  for (const user of all) {
    ctx.userIds.add(user.row.id);
    ctx.userRefs.set(user.row.id, user.refs);
  }
}

/** Letzter Schritt: Team, Mentor und Strukturleiter setzen, sobald alle Ziele existieren. */
export async function linkUsers(ctx: StepContext): Promise<void> {
  for (const [userId, refs] of ctx.userRefs) {
    const check = (target: string | null, exists: Set<string>, kind: string) => {
      if (!target) return null;
      if (exists.has(target)) return target;
      ctx.report.warn(`Verweis auf fehlende(n) ${kind} entfernt`, userId);
      return null;
    };
    const teamId = refs.teamId === "none" ? null : check(refs.teamId, ctx.teamIds, "Team");
    const mentorId = check(refs.mentorId, ctx.userIds, "Mentor");
    const strukturleiterId = check(refs.strukturleiterId, ctx.userIds, "Strukturleiter");
    if (!teamId && !mentorId && !strukturleiterId) continue;
    await ctx.tx.update(users).set({ teamId, mentorId, strukturleiterId }).where(eq(users.id, userId));
  }
}
