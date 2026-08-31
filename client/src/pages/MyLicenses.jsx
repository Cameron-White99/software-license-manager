import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { fetchMyLicenses } from "../api/assignments.js";
import { formatDate } from "../utils/date.js";

// R4: User views the licenses currently assigned to them.
// Mirrors the R4-MyLicenses Figma frame. Only Active assignments are returned -
// revoked ones belong to R8's history view, not this screen.
export default function MyLicenses() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchMyLicenses();
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
  }, []);

  return (
    <>
      <Header role="User" />
      <div className="content">
        <div className="card wide">
          <h2>My Licenses</h2>

          {loadError && <div className="banner">{loadError}</div>}

          {loading ? (
            <div className="empty-text">Loading your licenses…</div>
          ) : assignments.length === 0 ? (
            <div className="empty-text">You don&apos;t have any assigned licenses.</div>
          ) : (
            <ul className="request-list">
              {assignments.map((assignment) => (
                <li key={assignment._id} className="request-row">
                  <div className="request-main">
                    <div className="request-product">
                      {/* Populated from the License; an assignment cannot exist
                          without one, but degrade rather than crash if it did. */}
                      {assignment.licenseId?.productName ?? "Unknown product"}
                    </div>
                    <div className="request-meta">
                      Assigned {formatDate(assignment.createdAt)}
                    </div>
                  </div>
                  <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                    {assignment.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
