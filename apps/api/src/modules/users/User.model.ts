import { Schema, model, type Model, type Types } from "mongoose";
import { ROLES, type Role } from "@visit-flow/shared/roles";

/**
 * Sicht von v2 auf die v1-Collection `users`. Beschrieben sind nur die Felder, die v2 liest
 * oder schreibt; alle anderen bleiben unberührt, weil v2 nur gezielt per `updateOne` + `$set`
 * schreibt und nie ganze Dokumente speichert. `strict: false` sorgt dafür, dass beim Lesen
 * auch die Felder ankommen, die die Profil-Antwort für den v1-Client braucht.
 */
export interface UserDoc {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: Role;
  roles?: Role[];
  isActive?: boolean;
  isBlocked?: boolean;
  blockUntil?: Date | null;
  blockReason?: string | null;
  isWhitelisted?: boolean;
  whitelistStatus?: "pending" | "approved" | "rejected";
  teamId?: string | null;
  strukturleiterId?: string | null;
  mentorId?: string | null;
  paymentRequired?: boolean;
  giftedUntil?: Date | null;
  vodafoneContractStart?: Date | null;
  loginAttempts?: number;
  lockedUntil?: Date | null;
  lastActivity?: Date;
  [key: string]: unknown;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    name: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "berater" },
    isActive: Boolean,
    isBlocked: Boolean,
    blockUntil: Date,
    blockReason: String,
    isWhitelisted: Boolean,
    whitelistStatus: String,
    teamId: String,
    strukturleiterId: String,
    mentorId: String,
    loginAttempts: Number,
    lockedUntil: Date,
    lastActivity: Date,
  },
  // Indizes legt v1 an. v2 erzeugt keine eigenen auf fremden Collections.
  { collection: "users", strict: false, autoIndex: false, timestamps: false, versionKey: false },
);

export function userModel(): Model<UserDoc> {
  return model<UserDoc>("User", userSchema);
}
