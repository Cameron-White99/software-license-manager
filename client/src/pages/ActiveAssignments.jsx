import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchAssignments } from "../api/assignments.js";
import { fetchLicenses } from "../api/licenses.js";
import { formatDate } from "../utils/date.js";

// R5: Admin views all active license assignments across the organisation.
// Mirrors the R5-ActiveAssignments Figma frame: filter-by-license control, one
// row per assignment (product, user, assigned date) and a Revoke button.
// Each row's Revoke opens the R6 confirmation step.
export default function ActiveAssignments() {
  const [licenseId, setLicenseId] = useState("");
  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // The filter options come from inventory rather than from the assignments
  // themselves, so a license with no active seats is still selectable.
  useEffect(() => {
    let active = true;
    fetchLicenses()
      .then((data) => active && setLicenses(data))
      .catch(() => active && setLicenses([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchAssignments(licenseId || undefined);
        if (active) setAssignments(data);
      } catch (err) {
        if (active) setLoadError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [licenseId]);

  const filteredLicense = licenses.find((l) => l._id === licenseId);

  return (
    <>
      <Header role="Admin" />
      <div className="content">
        <div className="card wide">
          <h2>Active Assignments</h2>

          <div className="filter-row">
            <label className="filter-label" htmlFor="license-filter">
              License
            </label>
            <select
              id="license-filter"
              className="filter-select"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value)}
            >
              <option value="">All licenses</option>
              {licenses.map((license) => (
                <option key={license._id} value={license._id}>
                  {license.productName}
                </option>
              ))}
            </select>
          </div>

          {loadError && <div className="banner">{loadError}</div>}

          {loading ? (
            <div className="empty-text">Loading assignments…</div>
          ) : assignments.length === 0 ? (
            <div className="empty-text">
              {filteredLicense
                ? `No active assignments for ${filteredLicense.productName}.`
                : "No active assignments."}
            </div>
          ) : (
            <ul className="request-list">
              {assignments.map((assignment) => (
                <li key={assignment._id} className="request-row">
                  <div className="request-main">
                    <div className="request-product">
                      {assignment.licenseId?.productName ?? "Unknown product"}
                    </div>
                    <div className="request-meta">
                      {assignment.userId?.name ?? "Unknown user"} · assigned{" "}
                      {formatDate(assignment.createdAt)}
                    </div>
                  </div>
                  {/* R6: confirmation is required before the revoke is applied. */}
                  <Link to={`/assignments/${assignment._id}/revoke`} className="danger button-link">
                    Revoke
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
