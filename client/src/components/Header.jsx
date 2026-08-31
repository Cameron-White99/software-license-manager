import { Link } from "react-router-dom";

// Matches the Header / Admin and Header / User components built in Figma.
// Role is passed in by each page for now — will read from real auth/session once
// login exists (out of scope, see Phase 1 assumptions).
const ROLES = ["Admin", "User"];

export default function Header({ role }) {
  // `role` is required and deliberately has no default. It previously defaulted
  // to "Admin", which meant a page that forgot the prop silently rendered Admin
  // navigation — the more dangerous direction to fail in. Raised during the RBAC
  // audit (PR #6); failing loudly here makes the omission impossible to miss.
  // Navigation is presentation only: the API enforces roles regardless.
  if (!ROLES.includes(role)) {
    throw new Error(
      `Header requires role to be one of ${ROLES.join(" | ")}; received ${JSON.stringify(role)}.`
    );
  }

  const isAdmin = role === "Admin";

  return (
    <div className="header">
      <div className="logo">License Manager</div>
      <nav>
        {isAdmin ? (
          <>
            <Link to="/licenses">Manage Licenses</Link>
            <Link to="/requests">Pending Requests</Link>
            <Link to="/assignments">Active Assignments</Link>
          </>
        ) : (
          <>
            <Link to="/requests/new">Submit Request</Link>
            <Link to="/my-requests">My Requests</Link>
            <Link to="/my-licenses">My Licenses</Link>
          </>
        )}
        <span className={`role-pill ${isAdmin ? "admin" : "user"}`}>{role}</span>
      </nav>
    </div>
  );
}
