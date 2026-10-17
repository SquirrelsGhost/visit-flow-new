import { Schema, model, type Model, type Types } from "mongoose";

/**
 * v1-Collection `refresh_tokens`, gleiches Format wie v1 (server/src/models/RefreshToken.ts):
 * SHA-256 des Roh-Tokens, 7 Tage gültig, Rotationskette über `familyId`. Dadurch gilt ein
 * Refresh-Cookie aus v1 auch in v2 und umgekehrt. Den TTL-Index auf `expiresAt` legt v1 an.
 */
export interface RefreshTokenDoc {
  tokenHash: string;
  userId: Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
  familyId: string;
  isRevoked: boolean;
}

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    tokenHash: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    familyId: { type: String, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { collection: "refresh_tokens", autoIndex: false, versionKey: false },
);

export function refreshTokenModel(): Model<RefreshTokenDoc> {
  return model<RefreshTokenDoc>("RefreshToken", refreshTokenSchema);
}
