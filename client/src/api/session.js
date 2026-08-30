// Stands in for a real login session — authentication is out of scope for this
// assessment (see Phase 1 assumptions). These ids match the demo accounts created
// by `npm run seed` in /server, and are sent as x-user-id / x-user-role headers.
// Once real auth exists, this module is the single place that changes.
export const DEMO_ADMIN_ID = "000000000000000000000001";
export const DEMO_USER_ID = "000000000000000000000002";
