import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

function key() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.includes("your-super-secret"))
    throw new Error(
      "JWT_SECRET must be a unique value of at least 32 characters",
    );
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(value: string) {
  const [version, iv, tag, payload] = value.split(".");
  if (version !== "v1" || !iv || !tag || !payload)
    throw new Error("Invalid encrypted value");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
