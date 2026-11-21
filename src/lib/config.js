// Central place for application-wide settings.
export const appConfig = {
  name: "Fixonest",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  authTokenKey: "token",
  authUserKey: "user",
  loginPath: "/login",
  // Read by index.html's pre-hydration script too (kept in sync manually
  // there since that script runs before any module import is possible).
  themeKey: "theme",
  // Must match backend/app/config/index.js's panels.customer exactly - the
  // backend rejects a login whose declared panel doesn't match the role.
  panel: "fixonest_frontend",
};
