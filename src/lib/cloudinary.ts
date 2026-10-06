import "server-only";
import { createHash } from "node:crypto";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/**
 * Signed direct upload: the browser uploads the file straight to Cloudinary using a short-lived
 * signature from our server. The API secret never leaves the server and files never pass through it.
 */
export function signUpload(subfolder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const base = (process.env.CLOUDINARY_FOLDER || "dental-demos").replace(/[^a-z0-9/_-]/gi, "");
  const folder = `${base}/${subfolder.replace(/[^a-z0-9_-]/gi, "") || "misc"}`;
  const timestamp = Math.floor(Date.now() / 1000);
  // Params must be sorted alphabetically: folder, timestamp
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return { cloudName, apiKey, folder, timestamp, signature };
}
