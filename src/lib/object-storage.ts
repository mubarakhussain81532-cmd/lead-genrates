import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getObjectStorageEnv } from "@/lib/env";

type S3Cache = {
  client: S3Client;
  bucket: string;
};

type GlobalWithS3 = typeof globalThis & {
  s3Cache?: S3Cache;
};

const globalWithS3 = globalThis as GlobalWithS3;

export function isMissingStorageObject(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("name" in error && (error.name === "NotFound" || error.name === "NoSuchKey")) {
    return true;
  }

  return (
    "$metadata" in error &&
    typeof error.$metadata === "object" &&
    error.$metadata !== null &&
    "httpStatusCode" in error.$metadata &&
    error.$metadata.httpStatusCode === 404
  );
}

function getS3(): S3Cache {
  if (globalWithS3.s3Cache) {
    return globalWithS3.s3Cache;
  }

  const env = getObjectStorageEnv();
  const storage: S3Cache = {
    client: new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    }),
    bucket: env.S3_BUCKET,
  };

  globalWithS3.s3Cache = storage;
  return storage;
}

export async function assertSampleExists(key: string): Promise<void> {
  const storage = getS3();
  await storage.client.send(
    new HeadObjectCommand({ Bucket: storage.bucket, Key: key }),
  );
}

export async function createPrivateUploadUrl(
  key: string,
  contentType: string,
): Promise<{ url: string; headers: Record<string, string> }> {
  const storage = getS3();
  const headers = {
    "Content-Type": contentType,
    "x-amz-server-side-encryption": "AES256",
  };
  const url = await getSignedUrl(
    storage.client,
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    }),
    { expiresIn: 300 },
  );

  return { url, headers };
}

export async function inspectPrivateObject(key: string): Promise<{
  contentLength?: number;
  contentType?: string;
  signature: Uint8Array;
}> {
  const storage = getS3();
  const metadata = await storage.client.send(
    new HeadObjectCommand({ Bucket: storage.bucket, Key: key }),
  );
  const object = await storage.client.send(
    new GetObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      Range: "bytes=0-15",
    }),
  );

  return {
    contentLength: metadata.ContentLength,
    contentType: metadata.ContentType,
    signature: object.Body
      ? await object.Body.transformToByteArray()
      : new Uint8Array(),
  };
}

export async function deletePrivateObject(key: string): Promise<void> {
  const storage = getS3();
  await storage.client.send(
    new DeleteObjectCommand({ Bucket: storage.bucket, Key: key }),
  );
}

export async function createSampleDownloadUrl(
  key: string,
  filename: string,
): Promise<string> {
  const storage = getS3();
  const command = new GetObjectCommand({
    Bucket: storage.bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  return getSignedUrl(storage.client, command, { expiresIn: 60 });
}

export async function createPublicProductImageUrl(image: string): Promise<string> {
  if (image.startsWith("/") && !image.startsWith("//")) {
    return image;
  }

  const storage = getS3();
  return getSignedUrl(
    storage.client,
    new GetObjectCommand({
      Bucket: storage.bucket,
      Key: image,
      ResponseContentDisposition: "inline",
    }),
    { expiresIn: 15 * 60 },
  );
}

