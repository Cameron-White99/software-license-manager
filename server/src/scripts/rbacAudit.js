import express from "express";
import licenseRoutes from "../routes/licenses.js";
import requestRoutes from "../routes/requests.js";
import assignmentRoutes from "../routes/assignments.js";

// RBAC consolidation: one place that proves the whole role-based access surface,
// rather than the per-feature checks scattered across R1-R4's verification.
//
// Two parts:
//   1. AUDIT  - walks Express's actual router stack and reports every registered
//               route and whether it carries a requireRole guard. Reading the
//               router stack rather than grepping means a route registered
//               anywhere still shows up here.
//   2. PROBE  - hits every Admin-only endpoint as a User and every User-only
//               endpoint as an Admin, asserting 403 across the board.
//
// The probe needs a running server (npm run dev). The audit does not.

const DEMO_ADMIN_ID = "000000000000000000000001";
const DEMO_USER_ID = "000000000000000000000002";

// Mirrors the mounts in server.js. /api/health is included deliberately: it is
// intentionally public, and listing it keeps that visible rather than implicit.
function buildRouteTable() {
  const app = express();
  app.use("/api/licenses", licenseRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/assignments", assignmentRoutes);
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  const rows = [];

  function mountPathOf(layer) {
    // Express stores the mount path as a regexp like ^\/api\/licenses\/?(?=\/|$).
    // Recover the literal prefix: drop the anchor and the trailing lookahead,
    // then unescape the slashes.
    let source = layer.regexp?.source ?? "";
    if (!source.startsWith("^")) return "";
    source = source.slice(1);
    const tail = source.indexOf("\\/?(?=");
    if (tail !== -1) source = source.slice(0, tail);
    return source.split("\\/").join("/");
  }

  function walk(stack, prefix) {
    for (const layer of stack) {
      if (layer.route) {
        const path = prefix + layer.route.path;
        // requireRole tags its guard with the role it enforces, so the required
        // role here comes from the registered middleware itself.
        const roles = layer.route.stack
          .map((h) => h.handle?.requiredRole)
          .filter(Boolean);
        for (const method of Object.keys(layer.route.methods)) {
          rows.push({
            method: method.toUpperCase(),
            path,
            guarded: roles.length > 0,
            role: roles.join("+") || null,
          });
        }
      } else if (layer.handle?.stack) {
        walk(layer.handle.stack, prefix + mountPathOf(layer));
      }
    }
  }

  walk(app._router.stack, "");
  return rows;
}

function printAudit(rows) {
  console.log("=== RBAC AUDIT: every registered route ===\n");
  console.log("METHOD   PATH                              REQUIRED ROLE");
  console.log("-".repeat(66));
  for (const r of rows) {
    console.log(
      `${r.method.padEnd(8)} ${r.path.padEnd(33)} ${
        r.guarded ? `requireRole("${r.role}")` : "(none - public)"
      }`
    );
  }
  const unguarded = rows.filter((r) => !r.guarded);
  console.log(
    `\nRoutes: ${rows.length}   guarded: ${rows.length - unguarded.length}   unguarded: ${unguarded.length}`
  );
  if (unguarded.length) {
    console.log(
      "Unguarded: " + unguarded.map((r) => `${r.method} ${r.path}`).join(", ")
    );
  }
  return unguarded;
}

// Every role-protected endpoint, with the role it requires and a request that
// is otherwise well-formed - so a 403 can only come from the role check.
const PROTECTED = [
  { method: "POST", path: "/api/licenses", role: "Admin", body: { productName: "X", vendor: "Y", totalSeats: 1 } },
  { method: "GET", path: "/api/licenses", role: "Admin" },
  { method: "GET", path: "/api/requests", role: "Admin" },
  { method: "GET", path: "/api/requests/000000000000000000000009", role: "Admin" },
  { method: "PATCH", path: "/api/requests/000000000000000000000009/approve", role: "Admin" },
  { method: "PATCH", path: "/api/requests/000000000000000000000009/reject", role: "Admin" },
  { method: "POST", path: "/api/requests", role: "User", body: { productRequested: "X" } },
  { method: "GET", path: "/api/requests/mine", role: "User" },
  { method: "GET", path: "/api/assignments/mine", role: "User" },
  { method: "GET", path: "/api/assignments/mine/history", role: "User" },
  { method: "GET", path: "/api/assignments", role: "Admin" },
  { method: "PATCH", path: "/api/assignments/000000000000000000000009/revoke", role: "Admin" },
];

async function probe(base) {
  console.log("\n=== RBAC PROBE: wrong role must get 403 ===\n");
  let pass = 0;
  const results = [];

  for (const route of PROTECTED) {
    const wrongRole = route.role === "Admin" ? "User" : "Admin";
    const wrongId = wrongRole === "Admin" ? DEMO_ADMIN_ID : DEMO_USER_ID;

    const headers = {
      "Content-Type": "application/json",
      "x-user-role": wrongRole,
      "x-user-id": wrongId,
    };
    const res = await fetch(base + route.path, {
      method: route.method,
      headers,
      body: route.body ? JSON.stringify(route.body) : undefined,
    });

    // Also confirm the endpoint refuses a request carrying no role at all.
    const anon = await fetch(base + route.path, {
      method: route.method,
      headers: { "Content-Type": "application/json" },
      body: route.body ? JSON.stringify(route.body) : undefined,
    });

    const ok = res.status === 403 && anon.status === 403;
    if (ok) pass++;
    results.push({ ...route, wrongRole, status: res.status, anonStatus: anon.status, ok });

    console.log(
      `${ok ? "PASS" : "FAIL"}  ${route.method.padEnd(6)} ${route.path.padEnd(50)} ` +
        `needs ${route.role.padEnd(5)} | as ${wrongRole.padEnd(5)}: ${res.status} | no role: ${anon.status}`
    );
  }

  console.log(`\n${pass}/${PROTECTED.length} endpoints correctly refused the wrong role`);
  return results;
}

// The PROTECTED list below is hand-written, so it could drift from the routes
// actually registered. Cross-check it against the audit: every guarded route
// must be probed, with the role the guard actually enforces.
function crossCheckCoverage(rows) {
  console.log("\n=== COVERAGE: every guarded route is probed ===\n");
  const normalise = (p) => p.replace(/\/$/, "") || "/";
  const probed = new Map(
    PROTECTED.map((r) => [
      `${r.method} ${normalise(r.path.replace(/000000000000000000000009/g, ":id"))}`,
      r.role,
    ])
  );

  const problems = [];
  for (const route of rows.filter((r) => r.guarded)) {
    const key = `${route.method} ${normalise(route.path)}`;
    if (!probed.has(key)) {
      problems.push(`${key} is guarded but never probed`);
    } else if (probed.get(key) !== route.role) {
      problems.push(
        `${key} enforces ${route.role} but the probe expects ${probed.get(key)}`
      );
    }
  }

  const guardedCount = rows.filter((r) => r.guarded).length;
  if (problems.length === 0) {
    console.log(`All ${guardedCount} guarded routes are covered by the probe, with matching roles.`);
  } else {
    for (const p of problems) console.log(`MISMATCH  ${p}`);
  }
  return problems;
}

async function main() {
  const rows = buildRouteTable();
  const unguarded = printAudit(rows);
  const coverageProblems = crossCheckCoverage(rows);

  // /api/health is intentionally public; any other unguarded route is a gap.
  const gaps = unguarded.filter((r) => r.path !== "/api/health");

  const base = process.env.RBAC_BASE_URL || "http://127.0.0.1:5000";
  let results = [];
  let probeSkipped = false;
  try {
    await fetch(base + "/api/health");
  } catch {
    probeSkipped = true;
  }

  if (probeSkipped) {
    // Static mode: no server (this is how CI runs it, with no Mongo). The audit
    // and coverage cross-check still run and still fail the build - only the
    // live 403 probe is skipped.
    console.log(`\nNo server reachable at ${base} - running audit only.`);
    console.log("Start the server ('npm run dev') to include the live 403 probe.");
    console.log("\n=== RESULT (audit only) ===");
    const staticProblems = gaps.length + coverageProblems.length;
    if (staticProblems === 0) {
      console.log("No unguarded routes, and every guarded route is covered by the probe list.");
    } else {
      if (gaps.length) console.log(`GAPS: ${gaps.map((r) => `${r.method} ${r.path}`).join(", ")}`);
      if (coverageProblems.length) console.log(`COVERAGE: ${coverageProblems.join("; ")}`);
    }
    process.exit(staticProblems === 0 ? 0 : 1);
  }

  results = await probe(base);
  const failures = results.filter((r) => !r.ok);

  console.log("\n=== RESULT ===");
  const problems = gaps.length + failures.length + coverageProblems.length;
  if (problems === 0) {
    console.log("No RBAC gaps found. Every role-protected route refuses both the wrong role");
    console.log("and anonymous access, and every guarded route is covered by the probe.");
    console.log("/api/health is unguarded by design - it exposes only { status: 'ok' }.");
  } else {
    if (gaps.length) console.log(`GAPS: ${gaps.map((r) => `${r.method} ${r.path}`).join(", ")}`);
    if (failures.length) console.log(`FAILURES: ${failures.map((r) => `${r.method} ${r.path}`).join(", ")}`);
    if (coverageProblems.length) console.log(`COVERAGE: ${coverageProblems.join("; ")}`);
  }
  process.exit(problems === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
