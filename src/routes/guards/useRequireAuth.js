import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index.js";
import { ROUTES } from "../constants.js";

// Shared by AuthGatedLink.jsx and any button-triggered "serious action"
// (liking a comment, opening the reply editor, ...) that should redirect a
// logged-out visitor to /login instead of performing the action. Most of
// the site is publicly browsable (see routes/config/open.routes.jsx) -
// this is the per-action gate for the handful of things that still need a
// session (booking, liking, commenting).
export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = (action) => (...args) => {
    if (!user) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }
    return action(...args);
  };

  return { isAuthenticated: Boolean(user), requireAuth };
}
