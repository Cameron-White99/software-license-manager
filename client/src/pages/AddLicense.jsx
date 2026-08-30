import { useState } from "react";
import Header from "../components/Header.jsx";
import { createLicense } from "../api/licenses.js";

// R2b: Admin adds a new license to inventory.
// Mirrors the R2b-AddLicense Figma frame: product name, vendor, total seats, submit.
export default function AddLicense() {
  const [productName, setProductName] = useState("");
  const [vendor, setVendor] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validate() {
    const next = {};
    if (!productName.trim()) next.productName = "Product name is required.";
    if (!vendor.trim()) next.vendor = "Vendor is required.";
    const seatsNum = Number(totalSeats);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) {
      next.totalSeats = "Total seats must be a positive integer.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);
    if (!validate()) return;

    try {
      await createLicense({ productName, vendor, totalSeats: Number(totalSeats) });
      setSuccess(true);
      setProductName("");
      setVendor("");
      setTotalSeats("");
      setErrors({});
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  return (
    <>
      <Header />
      <div className="content">
        <div className="card">
          <h2>Add License to Inventory</h2>

          {submitError && <div className="banner">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Figma Professional"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className={errors.productName ? "error" : ""}
              />
              {errors.productName && <div className="error-text">{errors.productName}</div>}
            </div>

            <div className="field">
              <label>Vendor</label>
              <input
                type="text"
                placeholder="e.g. Figma, Inc."
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className={errors.vendor ? "error" : ""}
              />
              {errors.vendor && <div className="error-text">{errors.vendor}</div>}
            </div>

            <div className="field">
              <label>Total Seats</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className={errors.totalSeats ? "error" : ""}
              />
              {errors.totalSeats && <div className="error-text">{errors.totalSeats}</div>}
            </div>

            <button type="submit" className="primary">
              Add License
            </button>

            {success && <div className="success-text">License added successfully.</div>}
          </form>
        </div>
      </div>
    </>
  );
}
