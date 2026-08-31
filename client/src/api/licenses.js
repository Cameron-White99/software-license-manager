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
