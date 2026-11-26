/**
 * Cloudflare R2 Storage Client & Utilities
 * Uses AWS S3 SDK v3 to communicate with Cloudflare R2 S3-compatible API.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export interface R2Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBase: string;
}

export function getR2Config(): R2Config {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  let endpoint = (process.env.R2_S3_API || "").trim();
  if (!endpoint && accountId) {
    endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  }
  const bucket = (process.env.R2_BUCKET_NAME || "ssczone-assets").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const publicBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://doc.ssczone.com").trim().replace(/\/+$/, "");

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBase,
  };
}

let _r2Client: S3Client | null = null;

export function getR2Client(): { client: S3Client; bucket: string; publicBase: string } {
  const cfg = getR2Config();
  if (!cfg.accessKeyId || !cfg.secretAccessKey) {
    throw new Error("Missing Cloudflare R2 credentials (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env.local)");
  }
  if (!_r2Client) {
    _r2Client = new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }
  return {
    client: _r2Client,
    bucket: cfg.bucket,
    publicBase: cfg.publicBase,
  };
}

/**
 * Upload a Buffer or Uint8Array to Cloudflare R2
 */
export async function uploadToR2({
  key,
  buffer,
  contentType,
  cacheControl = "public, max-age=31536000, immutable",
}: {
  key: string;
  buffer: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}): Promise<{ url: string; key: string }> {
  const { client, bucket, publicBase } = getR2Client();
  const cleanKey = key.replace(/^\/+/, "");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  );

  const url = `${publicBase}/${cleanKey}`;
  return { url, key: cleanKey };
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const { client, bucket } = getR2Client();
    const cleanKey = key.replace(/^\/+/, "");
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      })
    );
    return true;
  } catch (err) {
    console.warn(`[R2] Delete failed for ${key}:`, err);
    return false;
  }
}
