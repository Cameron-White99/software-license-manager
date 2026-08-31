import { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import { fetchMyRequests } from "../api/requests.js";
import { formatDate } from "../utils/date.js";

// R4: User views the status of their own requests.
// Mirrors the R4-MyRequests Figma frame. Scoping happens server-side from the
// x-user-id header - this screen never filters someone else's data out.
export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await fetchMyRequests();
        if (active) setRequests(data);
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
          <h2>My Requests</h2>

          {loadError && <div className="banner">{loadError}</div>}

          {loading ? (
            <div className="empty-text">Loading your requests…</div>
          ) : requests.length === 0 ? (
            <div className="empty-text">You haven&apos;t submitted any requests yet.</div>
          ) : (
            <ul className="request-list">
              {requests.map((request) => (
                <li key={request._id} className="request-row">
                  <div className="request-main">
                    <div className="request-product">{request.productRequested}</div>
                    <div className="request-meta">
                      Submitted {formatDate(request.createdAt)}
                    </div>
                  </div>
                  <span className={`status-badge ${request.status.toLowerCase()}`}>
                    {request.status}
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
