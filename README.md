# Software License Manager

Tracks software license inventory, requests, approvals, and revocations across
two roles (Admin, User) and two end-to-end workflows:

- **Workflow A** — License Request & Assignment (R1–R4)
- **Workflow B** — License Revocation & Reclamation (R5–R8)

Precondition for both: **R2b** — Admin adds licenses to inventory before they
can be requested or assigned.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React (Vite)

## Architecture summary

```
client/   React app — one page per screen, matching the Figma prototype frames
server/
  models/       Mongoose schemas: User, License, Request, Assignment
  controllers/  Business logic per requirement (e.g. licenseController.js = R2b)
  routes/       Express routes, grouped by resource
  middleware/   Role-based access control (see auth.js scope note)
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string to a hosted instance)

### Backend
```bash
cd server
cp .env.example .env   # edit MONGO_URI if needed
npm install
npm run seed           # creates the demo Admin/User accounts - see note below
npm run dev
```
Server runs on `http://localhost:5000`.

#### Seeding demo accounts

`npm run seed` creates one Admin and one User record with fixed IDs. This is
required before testing R1 (and R2-R4 downstream), because a license request
must reference a real user document, and there is no sign-up or login flow to
create one - authentication is out of scope per the Phase 1 assumptions.

The same fixed IDs are referenced client-side in `client/src/api/session.js`
and sent as the `x-user-id` header, standing in for a real session. The seed
is idempotent, so re-running it is safe.

### Frontend
```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173` (proxies `/api` to the backend).

## Current implementation status

| Requirement | Status |
|---|---|
| R2b — Add license to inventory | ✅ Implemented (model, API, UI) |
| R1 — Submit request | ✅ Implemented (model, API, UI) |
| R2 — View pending requests | ⬜ Not yet built |
| R3 — Approve & assign | ⬜ Not yet built |
| R4 — User dashboard | ⬜ Not yet built |
| R5 — View active assignments | ⬜ Not yet built |
| R6 — Revoke assignment | ⬜ Not yet built |
| R7 — Seat reclamation logic | ⬜ Not yet built |
| R8 — Revoked-access visibility | ⬜ Not yet built |

## Known limitations

- Authentication is out of scope (see Phase 1 assumptions). Role is passed via
  an `x-user-role` header, and user identity via an `x-user-id` header, to
  simulate a logged-in session. Both refer to the seeded demo accounts.
- No CI/CD pipeline — deployment to EC2 is manual and documented separately.

## Deployment

The client and server run as a **single Node process** on the EC2 instance:
Express serves the API under `/api/*` and also serves the built React app as
static files for everything else. This avoids needing Nginx or a second
process/port — one instance, one open port, one public URL.

### One-time EC2 setup
1. Launch an EC2 instance (Ubuntu, t2.micro is enough for this scope).
2. Security group: allow inbound **port 80** (HTTP) and **port 22** (SSH, restricted
   to your IP) only. No other ports need to be open.
3. Install Node.js (via nvm or NodeSource) and `git` on the instance.
4. Set up a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster instead
   of installing MongoDB locally on the instance — simpler and keeps the
   instance stateless.

### Deploying a build
```bash
# on the EC2 instance
git clone <your-repo-url>
cd license-manager

cd client
npm install
npm run build          # produces client/dist

cd ../server
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your Atlas connection string, PORT=80
npm run seed           # one-time: create the demo Admin/User accounts

sudo npm run start     # sudo needed to bind port 80; see note below
```

### Keeping it running
Use a process manager so the app survives SSH disconnects and instance
reboots:
```bash
sudo npm install -g pm2
cd server
sudo pm2 start src/server.js --name license-manager
pm2 save
pm2 startup            # follow the printed instructions to enable on reboot
```

### Security hygiene
- No secrets committed to the repo — `.env` is git-ignored; only `.env.example`
  (no real values) is tracked.
- Only ports 80 and 22 open in the security group; 22 restricted to a specific IP.
- Database credentials live in Atlas, not on the instance filesystem beyond `.env`.
- **Role-based access control** is enforced on every API route by
  `requireRole()` (`server/src/middleware/auth.js`). Run `npm run rbac:audit`
  in `/server` to re-verify: it walks Express's registered route table,
  reports each route's required role, and hits every protected endpoint with
  the wrong role and with no role at all, expecting 403. It exits non-zero if
  any route is unguarded, unprobed, or lets the wrong role through.
  `GET /api/health` is intentionally public and returns only `{ status: "ok" }`.
- Authentication itself is out of scope (Phase 1 assumptions), so role and
  user identity arrive as headers. In a production system these would come
  from a verified session or token — the headers are trivially forgeable and
  are a simulation of a logged-in session, not a security boundary.

### Redeploying after a change
```bash
git pull
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart license-manager
```
CI/CD is out of scope for this assessment — the above is a manual, documented
procedure, run by hand each time.

### Live deployment
[EC2 public URL - Admin](http://3.27.167.247:3000/licenses)

[EC2 public URL - User](http://3.27.167.247:3000/requests/new)
