import axios from "axios";
import { toast } from "sonner";
import { appConfig } from "./config.js";

// The one axios instance every API call in the app goes through.
const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(appConfig.authTokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error notifier: every failed API call anywhere in the app surfaces
// its backend message via Sonner here, so features never need to toast
// errors themselves — see app/AppProviders.jsx for the single <Toaster />.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    toast.error(message);

    // Only treat a 401 as "your session expired" when the failed request
    // actually carried a bearer token. Without this check, a plain wrong
    // password on /auth/login (no token attached — the user isn't logged in
    // yet) would also wipe local storage and hard-redirect to /login,
    // reloading the page out from under the very form showing that error.
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadAuthHeader) {
      localStorage.removeItem(appConfig.authTokenKey);
      localStorage.removeItem(appConfig.authUserKey);
      window.location.href = appConfig.loginPath;
    }

    return Promise.reject(error);
  },
);

// The instance default above forces "Content-Type: application/json" on
// every request. Axios's transformRequest only lets a FormData body pass
// through untouched when it does NOT already see a JSON content type on the
// request - otherwise it assumes JSON was intended and actually
// JSON-stringifies the FormData, dropping the file and the multipart
// boundary entirely. So any FormData body needs that default header cleared
// per-request, letting axios/the browser set the correct
// "multipart/form-data; boundary=..." header itself.
const formDataConfig = (body, signal) =>
  body instanceof FormData ? { signal, headers: { "Content-Type": undefined } } : { signal };

// Thin, data-returning helpers on top of the instance above — every feature's
// API module should call these instead of `httpClient.get/post/...` directly,
// so call sites get parsed JSON back instead of a full axios response.
export const getJson = (path, { signal } = {}) =>
  httpClient.get(path, { signal }).then((response) => response.data);

export const postJson = (path, body, { signal } = {}) =>
  httpClient.post(path, body, formDataConfig(body, signal)).then((response) => response.data);

export const putJson = (path, body, { signal } = {}) =>
  httpClient.put(path, body, formDataConfig(body, signal)).then((response) => response.data);

export const patchJson = (path, body, { signal } = {}) =>
  httpClient.patch(path, body, formDataConfig(body, signal)).then((response) => response.data);

export const deleteJson = (path, { signal } = {}) =>
  httpClient.delete(path, { signal }).then((response) => response.data);

export default httpClient;
