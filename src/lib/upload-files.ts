export type UploadKind = "image" | "sample";

type UploadFileDetails = {
  extension: string;
  maxBytes: number;
};

const imageTypes = new Map<string, UploadFileDetails>([
  ["image/jpeg", { extension: "jpg", maxBytes: 5 * 1024 * 1024 }],
  ["image/png", { extension: "png", maxBytes: 5 * 1024 * 1024 }],
  ["image/webp", { extension: "webp", maxBytes: 5 * 1024 * 1024 }],
]);

const sampleTypes = new Map<string, UploadFileDetails>([
  ["application/pdf", { extension: "pdf", maxBytes: 20 * 1024 * 1024 }],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    { extension: "xlsx", maxBytes: 20 * 1024 * 1024 },
  ],
  ["application/vnd.ms-excel", { extension: "xls", maxBytes: 20 * 1024 * 1024 }],
]);

export function getUploadFileDetails(
  kind: UploadKind,
  contentType: string,
): UploadFileDetails | undefined {
  return (kind === "image" ? imageTypes : sampleTypes).get(contentType);
}

export function createUploadKey(
  kind: UploadKind,
  id: string,
  extension: string,
): string {
  const prefix = kind === "image" ? "products/images" : "samples";
  return `${prefix}/${id}.${extension}`;
}

export function isUploadKeyValid(
  kind: UploadKind,
  key: string,
  extension: string,
): boolean {
  const prefix = kind === "image" ? "products/images" : "samples";
  const filename = key.startsWith(`${prefix}/`)
    ? key.slice(prefix.length + 1)
    : "";
  const uuid = filename.endsWith(`.${extension}`)
    ? filename.slice(0, -(extension.length + 1))
    : "";

  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      uuid,
    )
  );
}

export function matchesFileSignature(
  kind: UploadKind,
  contentType: string,
  bytes: Uint8Array,
): boolean {
  if (kind === "image") {
    if (contentType === "image/jpeg") {
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }
    if (contentType === "image/png") {
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    }
    return (
      contentType === "image/webp" &&
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  if (contentType === "application/pdf") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  if (contentType === "application/vnd.ms-excel") {
    return (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0 &&
      bytes[4] === 0xa1 &&
      bytes[5] === 0xb1 &&
      bytes[6] === 0x1a &&
      bytes[7] === 0xe1
    );
  }
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}
