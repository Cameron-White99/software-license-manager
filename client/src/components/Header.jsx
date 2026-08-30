// Matches the Header / Admin component built in Figma.
// Role is hardcoded here for now — will read from real auth/session once login exists (out of scope, see Phase 1 assumptions).
export default function Header() {
  return (
    <div className="header">
      <div className="logo">License Manager</div>
      <nav>
        <a href="/licenses">Manage Licenses</a>
        <a href="/requests">Pending Requests</a>
        <a href="/assignments">Active Assignments</a>
        <span className="role-pill admin">Admin</span>
      </nav>
    </div>
  );
}
