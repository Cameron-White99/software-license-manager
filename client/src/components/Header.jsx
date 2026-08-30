import { Link } from "react-router-dom";

// Matches the Header / Admin and Header / User components built in Figma.
// Role is passed in by each page for now — will read from real auth/session once
// login exists (out of scope, see Phase 1 assumptions).
export default function Header({ role = "Admin" }) {
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
          </>
        )}
        <span className={`role-pill ${isAdmin ? "admin" : "user"}`}>{role}</span>
      </nav>
    </div>
  );
}
