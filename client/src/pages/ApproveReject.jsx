import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchRequest, approveRequest, rejectRequest } from "../api/requests.js";

// R3: Admin approves a request (assigning a license seat) or rejects it.
// Mirrors the R3-ApproveReject-Default Figma frame. The no-seats error state
// (R3-ApproveReject-Error) belongs to R3a and is not built here.
function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApproveReject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [license, setLicense] = useState(null);
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
        const data = await fetchRequest(id);
        if (!active) return;
        setRequest(data.request);
        setLicense(data.license);
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

  async function handleAction(action) {
    setActionError("");
    setBusy(true);
    try {
      await action(id);
      navigate("/requests");
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  }

  const seatsAvailable = license ? license.totalSeats - license.seatsUsed : null;
  const actionable = request?.status === "Pending";

  return (
    <>
      <Header role="Admin" />
      <div className="content">
        <div className="card">
          <h2>Review Request</h2>

          {loadError && <div className="banner">{loadError}</div>}
          {actionError && <div className="banner">{actionError}</div>}

          {loading ? (
            <div className="empty-text">Loading request…</div>
          ) : !request ? (
            <div className="empty-text">Request unavailable.</div>
          ) : (
            <>
              <div className="detail-row">
                <span className="detail-label">Requester</span>
                <span>{request.userId?.name ?? "Unknown user"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Product</span>
                <span>{request.productRequested}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Requested</span>
                <span>{formatDate(request.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge ${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Seats available</span>
                <span>
                  {license
                    ? `${seatsAvailable} of ${license.totalSeats}`
                    : "No matching license in inventory"}
                </span>
              </div>

              {actionable ? (
                <div className="action-row">
                  <button
                    type="button"
                    className="primary"
                    disabled={busy}
                    onClick={() => handleAction(approveRequest)}
                  >
                    Approve &amp; Assign
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={() => handleAction(rejectRequest)}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="empty-text">
                  This request has already been {request.status.toLowerCase()}.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
