import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import LicenseSelect from "../components/LicenseSelect.jsx";
import { createRequest } from "../api/requests.js";
import { fetchAvailableLicenses } from "../api/licenses.js";

// R1: User submits a license request specifying the product they need.
// Mirrors the R1-SubmitRequest-Default / R1-SubmitRequest-Error Figma frames.
//
// The product was originally a free-text field, which R3 then matched against
// license.productName - a case- and whitespace-sensitive comparison, so a typo
// produced a request that could never be approved. The dropdown submits the
// exact stored productName, so that mismatch is no longer possible.
export default function SubmitRequest() {
  const [productRequested, setProductRequested] = useState("");
  const [licenses, setLicenses] = useState([]);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoadingLicenses(true);
      try {
        const data = await fetchAvailableLicenses();
        if (active) setLicenses(data);
      } catch (err) {
        // The form is unusable without the list, so surface this rather than
        // showing an empty dropdown that looks like "nothing exists".
        if (active) setSubmitError(err.message);
      } finally {
        if (active) setLoadingLicenses(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Mirrors the server-side rule in requestController.js (server is source of truth).
  function validate() {
    const next = {};
    if (!productRequested.trim()) next.productRequested = "Please select a product.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);
    if (!validate()) return;

    try {
      await createRequest({ productRequested });
      setSuccess(true);
      setProductRequested("");
      setErrors({});
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  const noLicenses = !loadingLicenses && licenses.length === 0;

  return (
    <>
      <Header role="User" />
      <div className="content">
        <div className="card">
          <h2>Submit License Request</h2>

          {submitError && <div className="banner">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <LicenseSelect
              id="product-select"
              label="Product Name"
              placeholder={loadingLicenses ? "Loading products…" : "Select a product"}
              value={productRequested}
              onChange={(value) => setProductRequested(value)}
              disabled={loadingLicenses || noLicenses}
              error={errors.productRequested}
              // The value is the productName, not an id: R3 approves by matching
              // request.productRequested against license.productName, so keeping
              // the name means that contract is unchanged.
              options={licenses.map((license) => ({
                value: license.productName,
                label: `${license.productName} — ${license.seatsAvailable} seat${
                  license.seatsAvailable === 1 ? "" : "s"
                } available`,
              }))}
            />

            {noLicenses && (
              <div className="empty-text">
                No licenses are available to request. Ask an administrator to add one.
              </div>
            )}

            <button type="submit" className="primary" disabled={loadingLicenses || noLicenses}>
              Submit Request
            </button>

            {success && (
              <div className="success-text">Request submitted and is now pending approval.</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
