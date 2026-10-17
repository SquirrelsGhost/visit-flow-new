import { z } from "zod";
import { CONSENT_CATEGORIES, CONSENT_SOURCES, CONSENT_VERSION } from "./consent";

const choiceShape = Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category, z.boolean()])) as Record<
  (typeof CONSENT_CATEGORIES)[number],
  z.ZodBoolean
>;

/** Body von POST /api/consent. Die ID erzeugt der Client; sie identifiziert nur die Entscheidung. */
export const consentLogInputSchema = z.object({
  id: z.string().regex(/^[\w-]{8,64}$/),
  v: z.literal(CONSENT_VERSION),
  choice: z.object(choiceShape).strict(),
  source: z.enum(CONSENT_SOURCES),
});

export type ConsentLogInput = z.infer<typeof consentLogInputSchema>;

export const consentIdParamsSchema = z.object({ id: z.string().regex(/^[\w-]{8,64}$/) });
