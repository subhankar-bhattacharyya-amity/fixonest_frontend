// Every role the auth feature knows about. "Role" is auth domain knowledge
// (not tied to any single page), so it's colocated here instead of any
// pages/<name>/definitions/ folder. Values mirror the backend's canonical
// Role.name strings (backend/app/config/index.js's `roles` map) — this
// frontend only ever authenticates as "customer", but the full set is kept
// here for any future role-aware display logic.
export const ROLES = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};
