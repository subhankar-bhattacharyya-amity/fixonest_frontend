import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../store/authSlice.js";
import { appConfig } from "@/lib/config.js";

// Mounted once in app/AppProviders.jsx. If a token survived from a previous
// visit, re-fetch the full profile on a fresh page load so an expired/revoked
// token is caught immediately (httpClient's 401 handler then clears it and
// redirects) instead of only surfacing on the next manual navigation.
export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem(appConfig.authTokenKey)) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return null;
}
