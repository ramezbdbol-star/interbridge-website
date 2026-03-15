import path from "path";
import { Storage } from "@google-cloud/storage";
import { blogStore } from "./blogStore";

const storage = new Storage();

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME?.trim() || "";
const GCS_PUBLIC_BASE_URL = process.env.GCS_PUBLIC_BASE_URL?.trim() || "";
const GCS_MAKE_PUBLIC = process.env.GCS_MAKE_PUBLIC !== "false";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxUploadSizeBytes = 5 * 1024 * 1024;

export function hasMediaUploadConfig(): boolean {
  return !!GCS_BUCKET_NAME;
}

function getBucket() {
  if (!GCS_BUCKET_NAME) {
    throw new Error("GCS_BUCKET_NAME is not configured.");
  }

  return storage.bucket(GCS_BUCKET_NAME);
}

function getPublicUrl(storagePath: string): string {
  if (GCS_PUBLIC_BASE_URL) {
    return `${GCS_PUBLIC_BASE_URL.replace(/\/$/, "")}/${storagePath}`;
  }

  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${storagePath}`;
}

export interface UploadMediaInput {
  fileName: string;
  mimeType: string;
  base64Data: string;
  alt: string;
}

export async function uploadMediaAsset(input: UploadMediaInput) {
  if (!allowedMimeTypes.has(input.mimeType)) {
    throw new Error("Unsupported image type. Please upload JPG, PNG, WEBP, or GIF.");
  }

  const buffer = Buffer.from(input.base64Data, "base64");
  if (buffer.length === 0) {
    throw new Error("Uploaded file was empty.");
  }

  if (buffer.length > maxUploadSizeBytes) {
    throw new Error("Uploaded file exceeds the 5MB limit.");
  }

  const safeBaseName = path.basename(input.fileName).replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = path.extname(safeBaseName) || ".bin";
  const stem = safeBaseName.replace(new RegExp(`${extension.replace(".", "\\.")}$`), "") || "image";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `blog-media/${id}-${stem}${extension}`;

  const bucket = getBucket();
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    contentType: input.mimeType,
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  if (GCS_MAKE_PUBLIC) {
    await file.makePublic().catch((error) => {
      console.warn("Failed to make uploaded media public:", error);
    });
  }

  return blogStore.createMediaAsset({
    kind: "image",
    fileName: safeBaseName,
    storagePath,
    url: getPublicUrl(storagePath),
    alt: input.alt,
    mimeType: input.mimeType,
    size: buffer.length,
    width: null,
    height: null,
  });
}

export async function deleteMediaAsset(id: string) {
  const asset = await blogStore.deleteMediaAsset(id);
  if (!asset) return undefined;

  if (GCS_BUCKET_NAME) {
    await getBucket()
      .file(asset.storagePath)
      .delete({ ignoreNotFound: true })
      .catch((error) => {
        console.warn("Failed to delete media asset from GCS:", error);
      });
  }

  return asset;
}
