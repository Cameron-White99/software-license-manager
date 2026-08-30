// Per Phase 1 assumptions: authentication itself is out of scope for this project.
// Role is passed via a simple header to simulate a logged-in user's role
// (e.g. from a seeded session/login not built as part of this assessment).
// This middleware only enforces role-based access control (R11 / cross-cutting).
export function requireRole(role) {
  return (req, res, next) => {
    const userRole = req.header("x-user-role");
    if (userRole !== role) {
      return res.status(403).json({ error: `Forbidden: ${role} role required.` });
    }
    next();
  };
}
