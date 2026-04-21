import { v2 as cloudinary } from "cloudinary";

/**
 * Derives the Cloudinary public_id from a secure URL.
 * e.g. https://res.cloudinary.com/cloud/image/upload/v123/portfolio/abc.jpg
 *   => portfolio/abc
 */
export function getCloudinaryPublicId(imageUrl: string): string {
  const afterUpload = imageUrl.split("/upload/")[1];
  if (!afterUpload) throw new Error(`Unexpected Cloudinary URL: ${imageUrl}`);
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  const publicId = getCloudinaryPublicId(imageUrl);
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
}
