import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const LoginPage = lazy(() => import("./login/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./register/RegisterPage.jsx"));
const VerifyOtpPage = lazy(() => import("./verify-otp/VerifyOtpPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./forgot-password/ForgotPasswordPage.jsx"));

export const authRoutes = [
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },
  { path: ROUTES.VERIFY_EMAIL, element: <VerifyOtpPage /> },
  { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
];
