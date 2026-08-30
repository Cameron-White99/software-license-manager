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
