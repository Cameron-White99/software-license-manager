import { DEMO_ADMIN_ID, DEMO_USER_ID } from "./session.js";

const BASE = "/api/assignments";

// R4: the signed-in User's currently held licenses. Active assignments only -
// revoked ones belong to R8's history view.
export async function fetchMyLicenses() {
  const res = await fetch(`${BASE}/mine`, {
    headers: {
      "x-user-role": "User", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_USER_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch your licenses.");
  }
  return data;
}

// R5: Admin views all active assignments, optionally filtered to one license.
export async function fetchAssignments(licenseId) {
  const url = licenseId ? `${BASE}?licenseId=${encodeURIComponent(licenseId)}` : BASE;
  const res = await fetch(url, {
    headers: {
      "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_ADMIN_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch assignments.");
  }
  return data;
}

// R6: Admin revokes an active assignment.
export async function revokeAssignment(id) {
  const res = await fetch(`${BASE}/${id}/revoke`, {
    method: "PATCH",
    headers: {
      "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_ADMIN_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to revoke assignment.");
  }
  return data;
}

// R8: the signed-in User's revoked licenses, for the read-only history view.
export async function fetchMyHistory() {
  const res = await fetch(`${BASE}/mine/history`, {
    headers: {
      "x-user-role": "User", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_USER_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch your license history.");
  }
  return data;
}
