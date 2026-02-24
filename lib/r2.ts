import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

export const R2_ENABLED =
  Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET) &&
  (Boolean(R2_ENDPOINT) || Boolean(R2_ACCOUNT_ID));

export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL ?? "";

/** Max upload size in bytes (configurable). Default 50MB for production. */
export const MAX_UPLOAD_BYTES = (() => {
  const v = process.env.MAX_UPLOAD_BYTES;
  if (v == null || v === "") return 50 * 1024 * 1024;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 50 * 1024 * 1024;
})();

function getClient(): S3Client | null {
  if (!R2_ENABLED) return null;
  const endpoint =
    R2_ENDPOINT ||
    (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : null);
  if (!endpoint) return null;
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Generate a presigned PUT URL for direct upload to R2.
 * @param key Object key (e.g. "uploads/sessionId/questionId/timestamp_filename")
 * @param contentType Content-Type header for the upload
 * @param expiresInSeconds URL validity (default 900 = 15 min)
 */
export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 900
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return url;
}

/**
 * Build the public URL for an object (for download links).
 * If R2_PUBLIC_BASE_URL is set, returns base + key; otherwise returns empty (caller uses relative /uploads/ path).
 */
export function getPublicUrl(key: string): string {
  if (!R2_PUBLIC_BASE_URL) return "";
  const base = R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  const k = key.startsWith("/") ? key.slice(1) : key;
  return `${base}/${k}`;
}
