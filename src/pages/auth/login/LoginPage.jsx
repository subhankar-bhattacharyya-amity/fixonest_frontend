import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useAuth, loginCustomer, loginValidationSchema, EMAIL_NOT_VERIFIED_CODE } from "@/features/auth/index.js";
import { ROUTES } from "@/routes/constants.js";
import { Button } from "@/components/common/buttons/index.js";
import { FormField, PasswordField } from "@/components/common/form/index.js";
import { AuthLayout } from "../components/index.js";

export default function LoginPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginValidationSchema),
    // Prefilled when arriving from the OTP page right after verifying.
    defaultValues: { email: location.state?.email ?? "", password: "" },
  });

  // `from` arrives either as a plain path (AuthGatedLink - the CTA the
  // customer clicked) or as a full location object (AuthGuard - a direct
  // URL visit to a protected page like /profile); normalize both to a path.
  const from = location.state?.from;
  const redirectTo = typeof from === "string" ? from : (from?.pathname ?? ROUTES.HOME);

  if (user) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (values) => {
    try {
      const result = await dispatch(loginCustomer(values)).unwrap();
      toast.success(result.message);
    } catch (error) {
      // The message is already surfaced globally by lib/httpClient.js's
      // response interceptor. An unverified email gets sent to the OTP page,
      // which emails a fresh code on arrival.
      if (error?.errors?.includes(EMAIL_NOT_VERIFIED_CODE)) {
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: values.email, from, autoResend: true } });
      }
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Book and manage your repair & household services."
      footer={
        <>
          New to Fixonest?{" "}
          <Link
            to={ROUTES.REGISTER}
            state={{ from: redirectTo }}
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <PasswordField
          id="password"
          label="Password"
          labelAction={
            // Carries whatever email is already typed, so the reset page can prefill it.
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              onClick={(event) => {
                event.preventDefault();
                navigate(ROUTES.FORGOT_PASSWORD, { state: { from, email: getValues("email")?.trim() } });
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          }
          autoComplete="current-password"
          error={errors.password?.message}
          registration={register("password")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
