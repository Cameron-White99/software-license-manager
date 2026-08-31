import { DEMO_USER_ID } from "./session.js";

const BASE = "/api/requests";

// R1: submit a license request as the current User.
export async function createRequest({ productRequested }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "User", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_USER_ID,
    },
    body: JSON.stringify({ productRequested }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to submit request.");
  }
  return data;
}
