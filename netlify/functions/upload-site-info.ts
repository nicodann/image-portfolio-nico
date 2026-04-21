import { SiteInfo } from "@/types/types";
import { Handler } from "@netlify/functions";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { requireAuth } from "@/lib/netlifyAuth";
import { updateGithubFile } from "@/lib/github";

const SITE_INFO_PATH = "content/site-info.json";

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

  // PARSE
  let parsed: { title: string };
  try {
    parsed = JSON.parse(event.body ?? "{}");
  } catch (err) {
    console.error("Form parse error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to parse form data" }),
    };
  }

  // VALIDATE
  const { title } = parsed;
  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing fields",
      }),
    };
  }

  //EDIT SITE INFO FILE on GITHUB
  try {
    await updateGithubFile<SiteInfo>(
      SITE_INFO_PATH,
      `Edit title: ${title}`,
      (current) => ({ ...current, ...parsed }),
    );
  } catch (err) {
    console.error("Github error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save siteInfo" }),
    };
  }

  // --- In local dev, also write directly to disk so the Next.js server sees it immediately ---
  if (process.env.NETLIFY_DEV === "true") {
    const localPath = join(process.cwd(), SITE_INFO_PATH);
    const current: SiteInfo = JSON.parse(readFileSync(localPath, "utf-8"));
    writeFileSync(
      localPath,
      JSON.stringify({ ...current, ...parsed }, null, 2) + "\n",
    );
  }

  //////////

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed),
  };
};
