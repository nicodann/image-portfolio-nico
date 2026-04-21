import type { Handler } from "@netlify/functions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";
import { Artwork } from "@/types/types";
import { requireAuth } from "@/lib/netlifyAuth";
import { updateGithubFile } from "@/lib/github";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// ---------------------------------------------------------------------------
// Cloudinary config
// ---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ARTWORK_PATH = "content/artwork.json";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // --- Auth ---
  const authError = await requireAuth(event);
  if (authError) return authError;

  // --- Parse body ---
  let parsed: { id: string; imageUrl: string };
  try {
    parsed = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to parse request body" }),
    };
  }

  const { id, imageUrl } = parsed;
  if (!id || !imageUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: id, imageUrl" }),
    };
  }

  // --- Delete from Cloudinary ---
  try {
    await deleteFromCloudinary(imageUrl);
  } catch (err) {
    console.error("Cloudinary error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete image from Cloudinary" }),
    };
  }

  // --- Remove from artwork.json on GitHub ---
  try {
    await updateGithubFile<Artwork[]>(
      ARTWORK_PATH,
      `Remove artwork: ${id}`,
      (current) => current.filter((a) => a.id !== id),
    );
  } catch (err) {
    console.error("GitHub error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update artwork metadata" }),
    };
  }

  // --- In local dev, also write directly to disk ---
  if (process.env.NETLIFY_DEV === "true") {
    const localPath = join(process.cwd(), ARTWORK_PATH);
    const current: Artwork[] = JSON.parse(readFileSync(localPath, "utf-8"));
    writeFileSync(
      localPath,
      JSON.stringify(
        current.filter((a) => a.id !== id),
        null,
        2,
      ) + "\n",
    );
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  };
};
