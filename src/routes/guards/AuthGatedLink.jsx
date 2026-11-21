import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index.js";
import { ROUTES } from "../constants.js";

// Drop-in replacement for react-router-dom's <Link> on any CTA that
// represents a "serious action" (booking a service/provider) - lets a
// logged-in customer navigate normally, but redirects a logged-out visitor
// to /login instead, remembering the intended destination as `from` so
// LoginPage can send them there once they're signed in.
export default function AuthGatedLink({ to, onClick, ...props }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (event) => {
    if (!user) {
      event.preventDefault();
      navigate(ROUTES.LOGIN, { state: { from: to } });
      return;
    }
    onClick?.(event);
  };

  return <Link to={to} onClick={handleClick} {...props} />;
}
