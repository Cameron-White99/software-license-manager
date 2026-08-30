import { useState } from "react";
import Header from "../components/Header.jsx";
import { createRequest } from "../api/requests.js";

// R1: User submits a license request specifying the product they need.
// Mirrors the R1-SubmitRequest-Default / R1-SubmitRequest-Error Figma frames.
export default function SubmitRequest() {
  const [productRequested, setProductRequested] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Mirrors the server-side rule in requestController.js (server is source of truth).
  function validate() {
    const next = {};
    if (!productRequested.trim()) next.productRequested = "Product name is required.";
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

  return (
    <>
      <Header role="User" />
      <div className="content">
        <div className="card">
          <h2>Submit License Request</h2>

          {submitError && <div className="banner">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="e.g. Figma Professional"
                value={productRequested}
                onChange={(e) => setProductRequested(e.target.value)}
                className={errors.productRequested ? "error" : ""}
              />
              {errors.productRequested && (
                <div className="error-text">{errors.productRequested}</div>
              )}
            </div>

            <button type="submit" className="primary">
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
