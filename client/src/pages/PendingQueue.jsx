import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchRequests } from "../api/requests.js";
import { formatDate } from "../utils/date.js";

// R2: Admin views the license request queue.
// Mirrors the R2-PendingQueue Figma frame: title, filter row, and one row per
// request showing product, requester name + date submitted, and a status badge.
const FILTERS = ["All", "Pending", "Approved", "Rejected"];


export default function PendingQueue() {
  const [filter, setFilter] = useState("Pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    // Ignore a resolved response if the filter changed while it was in flight,
    // so a slow earlier request can't overwrite a newer one.
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        // "All" maps to no status param — see listRequests in requestController.js.
        const data = await fetchRequests(filter === "All" ? undefined : filter);
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
  }, [filter]);

  return (
    <>
      <Header role="Admin" />
      <div className="content">
        <div className="card wide">
          <h2>License Requests</h2>

          <div className="filter-row">
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter ${filter === option ? "active" : ""}`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {loadError && <div className="banner">{loadError}</div>}

          {loading ? (
            <div className="empty-text">Loading requests…</div>
          ) : requests.length === 0 ? (
            <div className="empty-text">
              {filter === "All"
                ? "No requests have been submitted yet."
                : `No ${filter.toLowerCase()} requests.`}
            </div>
          ) : (
            <ul className="request-list">
              {requests.map((request) => (
                <li key={request._id} className="request-row">
                  {/* R3: rows open the approve/reject screen */}
                  <Link to={`/requests/${request._id}`} className="request-main">
                    <div className="request-product">{request.productRequested}</div>
                    <div className="request-meta">
                      {/* R1 guarantees userId resolves, but a request created before
                          that check could still be orphaned - fall back rather than crash. */}
                      {request.userId?.name ?? "Unknown user"} · {formatDate(request.createdAt)}
                    </div>
                  </Link>
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
