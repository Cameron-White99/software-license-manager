import { DEMO_USER_ID } from "./session.js";

const BASE = "/api/licenses";

export async function createLicense({ productName, vendor, totalSeats }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
    },
    body: JSON.stringify({ productName, vendor, totalSeats }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create license.");
  }
  return data;
}

// R5: the inventory list, used to populate the filter-by-license control on
// the active assignments screen. Wraps the existing Admin GET /api/licenses.
export async function fetchLicenses() {
  const res = await fetch(BASE, {
    headers: {
      "x-user-role": "Admin", // see server/src/middleware/auth.js for the scope note on this
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch licenses.");
  }
  return data;
}

// R1 (dropdown fix): the product list a User can request from. Returns only
// productName + seatsAvailable - see listAvailableLicenses on the server.
export async function fetchAvailableLicenses() {
  const res = await fetch(`${BASE}/available`, {
    headers: {
      "x-user-role": "User", // see server/src/middleware/auth.js for the scope note on this
      "x-user-id": DEMO_USER_ID,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch available licenses.");
  }
  return data;
}
