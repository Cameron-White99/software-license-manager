import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { fetchMyHistory } from "../api/assignments.js";
import { formatDate } from "../utils/date.js";

// R8: User views licenses whose access has been revoked.
// Mirrors the R8-LicenseHistory Figma frame: a read-only list - no actions,
// since a user cannot restore their own access. Active licenses live on the
// R4 My Licenses screen; this one is only ever revoked records.
export default function LicenseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchMyHistory();
        if (active) setHistory(data);
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
          <h2>License History</h2>

          {loadError && <div className="banner">{loadError}</div>}

          {loading ? (
            <div className="empty-text">Loading your history…</div>
          ) : history.length === 0 ? (
            <div className="empty-text">None of your licenses have been revoked.</div>
          ) : (
            <ul className="request-list">
              {history.map((assignment) => (
                <li key={assignment._id} className="request-row">
                  <div className="request-main">
                    <div className="request-product">
                      {assignment.licenseId?.productName ?? "Unknown product"}
                    </div>
                    <div className="request-meta">
                      {/* updatedAt is when the revoke happened; createdAt is when
                          the seat was first assigned. */}
                      Revoked {formatDate(assignment.updatedAt)}
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
