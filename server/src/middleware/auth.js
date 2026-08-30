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

// R1: the identity of the submitting User. Same simulation as the role header —
// with real auth this would come from the session/JWT rather than the client.
// Controllers must still validate it (see requestController.js).
export function getUserId(req) {
  return req.header("x-user-id");
}
