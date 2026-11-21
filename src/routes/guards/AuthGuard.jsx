import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/index.js";
import { ROUTES } from "../constants.js";

export default function AuthGuard() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
}
