import type { Handler, HandlerEvent } from "@netlify/functions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import Busboy from "busboy";
import sharp from "sharp";
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
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ARTWORK_PATH = "content/artwork.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ParsedForm {
  fields: Record<string, string>;
  file: { buffer: Buffer; mimetype: string } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseMultipart(event: HandlerEvent): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    let file: ParsedForm["file"] = null;

    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64")
      : Buffer.from(event.body ?? "");

    const bb = Busboy({
      headers: event.headers as Record<string, string>,
      limits: { fileSize: 50 * 1024 * 1024 },
    });

    bb.on("field", (name, value) => {
      fields[name] = value;
    });

    bb.on("file", (_name, stream, info) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        // Empty filename means no file was selected — ignore it
        if (info.filename) {
          file = { buffer: Buffer.concat(chunks), mimetype: info.mimeType };
        }
      });
    });

    bb.on("finish", () => resolve({ fields, file }));
    bb.on("error", reject);

    bb.write(rawBody);
    bb.end();
  });
}

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "portfolio" },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("No Cloudinary result"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // --- Auth ---
  const authError = await requireAuth(event);
  if (authError) return authError;

  // --- Parse form ---
  let parsed: ParsedForm;
  try {
    parsed = await parseMultipart(event);
  } catch (err) {
    console.error("Form parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to parse form data" }),
    };
  }

  const { fields, file } = parsed;
  const { id, title, year, description } = fields;

  if (!id || !title || !year || !description) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required fields: id, title, year, description",
      }),
    };
  }

  // --- Optionally process and replace image ---
  let newImageUrl: string | null = null;

  if (file) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid file type. Accepted: JPEG, PNG, WebP.",
        }),
      };
    }

    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(file.buffer)
        .resize({ width: 2000, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .withMetadata()
        .toBuffer();
    } catch (err) {
      console.error("Sharp error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Image processing failed" }),
      };
    }

    try {
      newImageUrl = await uploadToCloudinary(processedBuffer);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Image upload failed" }),
      };
    }
  }

  // --- Update artwork.json on GitHub ---
  let updatedArtwork: Artwork | null = null;

  try {
    await updateGithubFile<Artwork[]>(
      ARTWORK_PATH,
      `Edit artwork: ${title}`,
      (current) => {
        return current.map((a) => {
          if (a.id !== id) return a;
          updatedArtwork = {
            ...a,
            title,
            year: parseInt(year, 10),
            description,
            ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
          };
          return updatedArtwork;
        });
      },
    );
  } catch (err) {
    console.error("GitHub error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save artwork metadata" }),
    };
  }

  // --- Delete old image from Cloudinary if it was replaced ---
  if (newImageUrl && fields["oldImageUrl"]) {
    try {
      await deleteFromCloudinary(fields["oldImageUrl"]);
    } catch (err) {
      // Non-fatal: new image is already live and metadata updated
      console.error("Cloudinary old image delete error:", err);
    }
  }

  // --- In local dev, also write directly to disk ---
  if (process.env.NETLIFY_DEV === "true") {
    const localPath = join(process.cwd(), ARTWORK_PATH);
    const current: Artwork[] = JSON.parse(readFileSync(localPath, "utf-8"));
    writeFileSync(
      localPath,
      JSON.stringify(
        current.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            title,
            year: parseInt(year, 10),
            description,
            ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
          };
        }),
        null,
        2,
      ) + "\n",
    );
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedArtwork),
  };
};
