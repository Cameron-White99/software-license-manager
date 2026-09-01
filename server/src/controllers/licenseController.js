import License from "../models/License.js";

// R2b: Admin adds a new license to the inventory.
// Acceptance criteria:
//  - product name required (non-empty)
//  - total seats must be a positive integer
//  - created with seatsUsed = 0, status = Active
export async function createLicense(req, res) {
  try {
    const { productName, vendor, totalSeats } = req.body;

    if (!productName || !productName.trim()) {
      return res.status(400).json({ error: "Product name is required." });
    }
    if (!vendor || !vendor.trim()) {
      return res.status(400).json({ error: "Vendor is required." });
    }
    if (!Number.isInteger(totalSeats) || totalSeats < 1) {
      return res.status(400).json({ error: "Total seats must be a positive integer." });
    }

    const license = await License.create({
      productName: productName.trim(),
      vendor: vendor.trim(),
      totalSeats,
      seatsUsed: 0,
      status: "Active",
    });

    return res.status(201).json(license);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to create license." });
  }
}

// Supports R2/R3 later (approval needs to check available licenses),
// and gives R2b's own screen something to list.
export async function listLicenses(req, res) {
  try {
    const licenses = await License.find().sort({ createdAt: -1 });
    return res.json(licenses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch licenses." });
  }
}

// R1 (dropdown fix): the product list a User picks from on the Submit Request
// screen. Deliberately NOT the Admin listLicenses response - a User has no
// business seeing vendor, totalSeats, seatsUsed, timestamps or ids, so this
// returns only what the dropdown renders: the product name and whether a seat
// is currently free.
//
// productName is the contract with R3: approval matches
// request.productRequested against license.productName, so the dropdown
// submits the exact stored string and a typo can no longer break the match.
export async function listAvailableLicenses(req, res) {
  try {
    const licenses = await License.find()
      .select("productName totalSeats seatsUsed")
      .sort({ productName: 1 });

    // Shape the payload explicitly rather than leaking the documents: the
    // seat numbers are used to derive availability, not exposed themselves.
    const available = licenses.map((license) => ({
      productName: license.productName,
      seatsAvailable: Math.max(0, license.totalSeats - license.seatsUsed),
    }));

    return res.json(available);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch available licenses." });
  }
}
