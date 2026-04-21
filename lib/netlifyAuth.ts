import type { HandlerEvent, HandlerResponse } from "@netlify/functions";
import { verifyToken } from "./verifyToken";

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Returns a 401 HandlerResponse if auth fails, or null if auth passes.
 */
export async function requireAuth(
  event: HandlerEvent,
): Promise<HandlerResponse | null> {
  const authHeader =
    event.headers["authorization"] ?? event.headers["Authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "User not logged in: Missing authorization token.",
      }),
    };
  }

  const tokenValid = await verifyToken(token);
  if (!tokenValid) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: "Session expired, please login again: Invalid or expired token",
      }),
    };
  }

  return null;
}
