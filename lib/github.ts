const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function getGithubEnv() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo)
    throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO env vars");

  return { token, repo, branch };
}

/**
 * Reads a JSON file from GitHub, applies a transform, and writes it back.
 * Generic over the file's JSON shape T.
 */
export async function updateGithubFile<T>(
  filePath: string,
  commitMessage: string,
  transform: (current: T) => T,
): Promise<void> {
  const { token, repo, branch } = getGithubEnv();

  const headers = {
    ...GITHUB_HEADERS,
    Authorization: `Bearer ${token}`,
  };

  const getRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
    { headers },
  );
  if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);

  const fileData = (await getRes.json()) as { content: string; sha: string };
  const current: T = JSON.parse(
    Buffer.from(fileData.content, "base64").toString("utf-8"),
  );

  const updated = transform(current);
  const newContent = Buffer.from(
    JSON.stringify(updated, null, 2) + "\n",
  ).toString("base64");

  const putRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: commitMessage,
        content: newContent,
        sha: fileData.sha,
        branch,
      }),
    },
  );
  if (!putRes.ok) throw new Error(`GitHub PUT failed: ${putRes.status}`);
}
