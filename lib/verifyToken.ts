/** Verify the JWT by calling the Netlify Identity /user endpoint. */
export async function verifyToken(token: string): Promise<boolean> {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!siteUrl) {
    console.error(
      "No site URL env var (URL / DEPLOY_PRIME_URL) available for token verification.",
    );
    return false;
  }
  try {
    const res = await fetch(`${siteUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
