import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { User, Mail } from "lucide-react";
import {
  useAuth,
  registerCustomer,
  registerValidationSchema,
  savePendingVerification,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/features/auth/index.js";
import { ROUTES } from "@/routes/constants.js";
import { Button } from "@/components/common/buttons/index.js";
import { FormField, PasswordField, PhoneField } from "@/components/common/form/index.js";
import { AuthLayout } from "../components/index.js";

export default function RegisterPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerValidationSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  // `from` (the CTA the customer originally clicked, forwarded here via
  // LoginPage's "Create an account" link) survives the detour through
  // registration and is handed back to LoginPage so the customer still
  // lands on their intended destination after logging in.
  const from = location.state?.from;
  const redirectTo = typeof from === "string" ? from : (from?.pathname ?? ROUTES.HOME);

  if (user) return <Navigate to={redirectTo} replace />;

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...payload }) => {
    try {
      const result = await dispatch(registerCustomer(payload)).unwrap();
      // Registration emails a verification code and never issues a token
      // (see authSlice.js) — send the new customer to enter that code first.
      // The code's timers are remembered so a refresh keeps the countdowns.
      const sentAt = Date.now();
      const registeredEmail = result.data?.email ?? payload.email;
      savePendingVerification({
        email: registeredEmail,
        issuedAt: sentAt,
        expiresAt: result.data?.otp_expires_at ? new Date(result.data.otp_expires_at).getTime() : null,
        resendAvailableAt: sentAt + OTP_RESEND_COOLDOWN_SECONDS * 1000,
      });
      toast.success(result.message);
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: registeredEmail, from } });
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Book trusted repair & household professionals in a few taps."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          id="fullName"
          label="Full name"
          icon={<User className="h-5 w-5" />}
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.fullName?.message}
          registration={register("fullName")}
        />

        <FormField
          id="email"
          label="Email address"
          type="email"
          icon={<Mail className="h-5 w-5" />}
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          registration={register("email")}
        />

        <PhoneField id="phone" label="Phone number" name="phone" control={control} error={errors.phone?.message} />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          registration={register("password")}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-slate-400 dark:text-(--text-muted)">
          By creating an account, you agree to Fixonest's Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
