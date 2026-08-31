import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchAssignments, revokeAssignment } from "../api/assignments.js";
import { formatDate } from "../utils/date.js";

// R6: Admin confirms revoking an active assignment.
// Mirrors the R6-RevokeConfirm Figma frame: who and what is being revoked, a
// note that the seat is freed up, then Confirm Revoke / Cancel.
export default function RevokeConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        // There is no GET /assignments/:id endpoint, and adding one is not in
        // R6's scope - the active list already carries everything this screen
        // shows, so find the row in it.
        const all = await fetchAssignments();
        if (!active) return;
        const found = all.find((a) => a._id === id);
        if (!found) {
          setLoadError("That assignment is no longer active.");
        } else {
          setAssignment(found);
        }
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
  }, [id]);

  async function handleConfirm() {
    setActionError("");
    setBusy(true);
    try {
      await revokeAssignment(id);
      navigate("/assignments");
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  }

  const product = assignment?.licenseId?.productName ?? "this license";
  const person = assignment?.userId?.name ?? "this user";

  return (
    <>
      <Header role="Admin" />
      <div className="content">
        <div className="card">
          <h2>Revoke Assignment</h2>

          {loadError && <div className="banner">{loadError}</div>}
          {actionError && <div className="banner">{actionError}</div>}

          {loading ? (
            <div className="empty-text">Loading assignment…</div>
          ) : !assignment ? (
            <div className="action-row">
              <button type="button" className="secondary" onClick={() => navigate("/assignments")}>
                Back to assignments
              </button>
            </div>
          ) : (
            <>
              <p className="confirm-text">
                Revoke <strong>{product}</strong> from <strong>{person}</strong>?
              </p>

              <div className="detail-row">
                <span className="detail-label">Product</span>
                <span>{product}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned to</span>
                <span>{person}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned</span>
                <span>{formatDate(assignment.createdAt)}</span>
              </div>

              <p className="confirm-note">
                This frees up a seat on {product} for reassignment. The assignment is
                kept in history rather than deleted.
              </p>

              <div className="action-row">
                <button type="button" className="danger solid" disabled={busy} onClick={handleConfirm}>
                  Confirm Revoke
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => navigate("/assignments")}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
