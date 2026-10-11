
import { Link } from 'react-router-dom';


export default function Header({ role }) {


  const ROLES = ['Admin', 'User'];

  if (!ROLES.includes(role)) {
    throw new Error(
      `Header requires role to be Admin or User; received ${JSON.stringify(role)}.`
    );
  }

  const isAdmin = role === 'Admin';

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3">
      <div className="fw-bold text-primary">
        License Manager
      </div>

      <nav className="d-flex flex-wrap align-items-center gap-3">
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
            <Link to="/my-history">History</Link>

            {/* Feedback Module - Abhay */}
            <Link to="/feedback">Submit Feedback</Link>
            <Link to="/feedback/history">Past Feedback</Link>
          </>
        )}

        <span className="badge bg-secondary">
          {role}
        </span>
      </nav>
    </div>
  );
}
