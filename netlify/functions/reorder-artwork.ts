import type { Handler } from "@netlify/functions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Artwork } from "@/types/types";
import { requireAuth } from "@/lib/netlifyAuth";
import { updateGithubFile } from "@/lib/github";

const ARTWORK_PATH = "content/artwork.json";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const authError = await requireAuth(event);
  if (authError) return authError;

  let parsed: { ids: string[] };
  try {
    parsed = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to parse request body" }),
    };
  }

  const { ids } = parsed;
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required field: ids" }),
    };
  }

  try {
    await updateGithubFile<Artwork[]>(
      ARTWORK_PATH,
      "Reorder artwork",
      (current) => {
        const map = new Map(current.map((a) => [a.id, a]));
        return ids.flatMap((id) => {
          const item = map.get(id);
          return item ? [item] : [];
        });
      },
    );
  } catch (err) {
    console.error("GitHub error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update artwork order" }),
    };
  }

  if (process.env.NETLIFY_DEV === "true") {
    const localPath = join(process.cwd(), ARTWORK_PATH);
    const current: Artwork[] = JSON.parse(readFileSync(localPath, "utf-8"));
    const map = new Map(current.map((a) => [a.id, a]));
    const reordered = ids.flatMap((id) => {
      const item = map.get(id);
      return item ? [item] : [];
    });
    writeFileSync(localPath, JSON.stringify(reordered, null, 2) + "\n");
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
