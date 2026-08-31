import { DEMO_ADMIN_ID, DEMO_USER_ID } from "./session.js";

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

// R2: Admin fetches the request queue. Omitting status returns all statuses,
// which is what the "All" filter uses.
export async function fetchRequests(status) {
  const url = status ? `${BASE}?status=${encodeURIComponent(status)}` : BASE;
  const res = await fetch(url, {
    headers: {
      "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_ADMIN_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch requests.");
  }
  return data;
}

// R3: shared Admin headers for the approve/reject screen.
const adminHeaders = {
  "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
  "x-user-id": DEMO_ADMIN_ID,
};

// R3: load one request plus the matching license, for the approve/reject screen.
export async function fetchRequest(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: adminHeaders });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch request.");
  }
  return data;
}

// R3: approve a pending request, assigning a license seat to the requester.
export async function approveRequest(id) {
  const res = await fetch(`${BASE}/${id}/approve`, {
    method: "PATCH",
    headers: adminHeaders,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to approve request.");
  }
  return data;
}

// R3: reject a pending request. No assignment is created.
export async function rejectRequest(id) {
  const res = await fetch(`${BASE}/${id}/reject`, {
    method: "PATCH",
    headers: adminHeaders,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reject request.");
  }
  return data;
}
