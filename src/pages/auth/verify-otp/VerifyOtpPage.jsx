import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  Inbox,
  LoaderCircle,
  Mail,
  MailCheck,
  PencilLine,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import {
  useAuth,
  verifyEmailOtp,
  resendEmailOtp,
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
  otpValidationSchema,
  otpEmailValidationSchema,
  readPendingVerification,
  savePendingVerification,
  clearPendingVerification,
} from "@/features/auth/index.js";
import { ROUTES } from "@/routes/constants.js";
import { Button } from "@/components/common/buttons/index.js";
import { FormField } from "@/components/common/form/index.js";
import { AuthLayout, OtpInput } from "../components/index.js";

const SUCCESS_REDIRECT_SECONDS = 5;

const PRIMARY_BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100";

const PHASE_COPY = {
  email: {
    eyebrow: "Verify your email",
    title: "Let's verify your email",
    subtitle: "Enter the email you signed up with and we'll send you a fresh code.",
  },
  verify: {
    eyebrow: "One last step",
    title: "Check your inbox",
    subtitle: `Enter the ${OTP_LENGTH}-digit code we emailed you to activate your account.`,
  },
  success: {
    eyebrow: "All set",
    title: "You're verified!",
    subtitle: "Your Fixonest account is now active.",
  },
};

const CONFETTI = [
  { x: -62, y: -38, color: "bg-indigo-500" },
  { x: 58, y: -46, color: "bg-fuchsia-500" },
  { x: -44, y: 52, color: "bg-amber-400" },
  { x: 66, y: 30, color: "bg-emerald-400" },
  { x: 0, y: -70, color: "bg-violet-500" },
  { x: -74, y: 6, color: "bg-sky-400" },
  { x: 32, y: 64, color: "bg-rose-400" },
  { x: 76, y: -8, color: "bg-indigo-400" },
];

const toMs = (value) => (value ? new Date(value).getTime() : null);

function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// Re-renders once a second while `active`, driving every countdown on the page.
function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function EnvelopeBadge({ reduceMotion }) {
  return (
    <div className="relative mx-auto h-20 w-20">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl bg-linear-to-br from-indigo-500 to-fuchsia-500 blur-xl"
        initial={{ opacity: 0.3 }}
        animate={reduceMotion ? { opacity: 0.3 } : { scale: [1, 1.18, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-white dark:ring-(--surface-1)"
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <MailCheck className="h-9 w-9" strokeWidth={1.75} />
        </motion.span>
      </motion.div>
      <motion.span
        className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-white dark:ring-(--surface-1)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 15 }}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
      </motion.span>
    </div>
  );
}

// Small ring that empties as the resend cooldown runs out.
function CountdownRing({ progress }) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 18 18" className="h-4.5 w-4.5 -rotate-90" aria-hidden="true">
      <circle cx="9" cy="9" r={radius} fill="none" strokeWidth="2" className="stroke-slate-200 dark:stroke-(--border-subtle)" />
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-indigo-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
      />
    </svg>
  );
}

function SuccessMark({ reduceMotion }) {
  return (
    <div className="relative mx-auto h-24 w-24">
      {!reduceMotion &&
        [0, 1].map((ring) => (
          <motion.span
            key={ring}
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 + ring * 0.9, ease: "easeOut" }}
          />
        ))}
      {!reduceMotion &&
        CONFETTI.map((dot, index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dot.color}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: dot.x, y: dot.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ delay: 0.3 + index * 0.03, duration: 1.1, ease: "easeOut" }}
          />
        ))}
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-50 dark:ring-emerald-500/10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
      >
        <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const from = location.state?.from;

  // { email, issuedAt, expiresAt, resendAvailableAt } — seeded by
  // RegisterPage via sessionStorage, or just { email } when LoginPage sends
  // an unverified customer here.
  const [session, setSession] = useState(() => {
    const stored = readPendingVerification();
    const stateEmail = location.state?.email;
    if (stored?.email && (!stateEmail || stored.email === stateEmail)) return stored;
    return stateEmail ? { email: stateEmail } : null;
  });
  const email = session?.email ?? null;

  const [phase, setPhase] = useState(email ? "verify" : "email");
  const [otpStatus, setOtpStatus] = useState("idle");
  const [inlineError, setInlineError] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState(null);
  const autoResendDone = useRef(false);

  const otpForm = useForm({
    resolver: zodResolver(otpValidationSchema),
    defaultValues: { otp: "" },
  });
  const emailForm = useForm({
    resolver: zodResolver(otpEmailValidationSchema),
    defaultValues: { email: email ?? "" },
  });
  const isVerifying = otpForm.formState.isSubmitting;

  const now = useNow(phase !== "email");
  const issuedAt = toMs(session?.issuedAt);
  const expiresAt = toMs(session?.expiresAt);
  const resendAt = toMs(session?.resendAvailableAt);
  const secondsToExpiry = expiresAt ? (expiresAt - now) / 1000 : null;
  const isExpired = secondsToExpiry !== null && secondsToExpiry <= 0;
  const isExpiringSoon = secondsToExpiry !== null && secondsToExpiry > 0 && secondsToExpiry <= 60;
  const expiryProgress =
    expiresAt && issuedAt && expiresAt > issuedAt
      ? Math.min(1, Math.max(0, (expiresAt - now) / (expiresAt - issuedAt)))
      : null;
  const secondsToResend = resendAt ? Math.max(0, (resendAt - now) / 1000) : 0;
  const resendProgress = Math.min(1, secondsToResend / OTP_RESEND_COOLDOWN_SECONDS);

  const goToLogin = () => navigate(ROUTES.LOGIN, { replace: true, state: { from, email } });

  const resetOtp = () => {
    otpForm.setValue("otp", "");
    setOtpStatus("idle");
    setInlineError(null);
  };

  const handleResend = async (targetEmail = email) => {
    if (!targetEmail || isResending) return false;
    setIsResending(true);
    try {
      const result = await dispatch(resendEmailOtp({ email: targetEmail })).unwrap();
      const sentAt = Date.now();
      const next = {
        email: targetEmail,
        issuedAt: sentAt,
        expiresAt: toMs(result.data?.expiresAt),
        resendAvailableAt: toMs(result.data?.resendAvailableAt) ?? sentAt + OTP_RESEND_COOLDOWN_SECONDS * 1000,
      };
      setSession(next);
      savePendingVerification(next);
      resetOtp();
      setPhase("verify");
      toast.success(result.message);
      return true;
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
      return false;
    } finally {
      setIsResending(false);
    }
  };

  // Sent here from LoginPage: their original code has most likely expired,
  // so email a fresh one straight away — unless a code is still clearly valid.
  useEffect(() => {
    if (!location.state?.autoResend || autoResendDone.current || !email) return;
    autoResendDone.current = true;
    navigate(location.pathname, { replace: true, state: { ...location.state, autoResend: false } });
    if (expiresAt && expiresAt - Date.now() > 30 * 1000) return;
    handleResend(email);
    // Runs once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "success") return undefined;
    const id = setTimeout(goToLogin, SUCCESS_REDIRECT_SECONDS * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (user) return <Navigate to={ROUTES.HOME} replace />;

  const onVerify = async ({ otp }) => {
    try {
      const result = await dispatch(verifyEmailOtp({ email, otp })).unwrap();
      setOtpStatus("success");
      clearPendingVerification();
      toast.success(result.message);
      // Let the boxes flash green for a beat before the celebration screen.
      setTimeout(() => {
        setVerifiedAt(Date.now());
        setPhase("success");
      }, 700);
    } catch (error) {
      setOtpStatus("error");
      setInlineError(error?.message || "That code didn't work. Please try again.");
      otpForm.setValue("otp", "");
      setShakeKey((key) => key + 1);
    }
  };

  const submitOtp = otpForm.handleSubmit(onVerify);

  const onEmailSubmit = async ({ email: enteredEmail }) => {
    await handleResend(enteredEmail);
  };

  const otpError = inlineError || otpForm.formState.errors.otp?.message;
  const redirectIn = verifiedAt
    ? Math.max(0, Math.ceil(SUCCESS_REDIRECT_SECONDS - (now - verifiedAt) / 1000))
    : SUCCESS_REDIRECT_SECONDS;
  const copy = PHASE_COPY[phase];

  const backToLogin =
    phase === "success" ? null : (
      <Link
        to={ROUTES.LOGIN}
        state={{ from }}
        className="group inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to log in
      </Link>
    );

  return (
    <AuthLayout eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} footer={backToLogin}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === "verify" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-center">
              <EnvelopeBadge reduceMotion={reduceMotion} />
              <p className="mt-6 text-sm text-slate-500 dark:text-(--text-muted)">We sent a code to</p>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <span className="break-all text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    emailForm.setValue("email", email ?? "");
                    setPhase("email");
                  }}
                  aria-label="Use a different email"
                  title="Use a different email"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-(--text-muted) dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <form className="mt-7" onSubmit={submitOtp} noValidate>
              <Controller
                name="otp"
                control={otpForm.control}
                render={({ field }) => (
                  <OtpInput
                    length={OTP_LENGTH}
                    value={field.value}
                    onChange={(next) => {
                      field.onChange(next);
                      if (otpStatus === "error") {
                        setOtpStatus("idle");
                        setInlineError(null);
                      }
                      if (otpForm.formState.errors.otp) otpForm.clearErrors("otp");
                    }}
                    onComplete={() => {
                      if (!isVerifying && !isExpired && otpStatus !== "success") submitOtp();
                    }}
                    status={otpStatus}
                    shakeKey={shakeKey}
                    disabled={isVerifying || otpStatus === "success"}
                    autoFocus
                    ariaDescribedBy="otp-status"
                  />
                )}
              />

              <div id="otp-status" aria-live="polite" className="mt-6 min-h-11 space-y-2.5">
                <AnimatePresence mode="wait" initial={false}>
                  {otpError ? (
                    <motion.p
                      key="error"
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      {otpError}
                    </motion.p>
                  ) : isExpired ? (
                    <motion.p
                      key="expired"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                      This code has expired. Request a new one below.
                    </motion.p>
                  ) : secondsToExpiry !== null ? (
                    <motion.p
                      key="timer"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-(--text-muted)"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Code expires in
                      <span
                        className={`font-semibold tabular-nums ${
                          isExpiringSoon ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-(--text-primary)"
                        }`}
                      >
                        {formatClock(secondsToExpiry)}
                      </span>
                    </motion.p>
                  ) : (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-xs text-slate-400 dark:text-(--text-muted)"
                    >
                      Tip: you can paste the whole code into any box.
                    </motion.p>
                  )}
                </AnimatePresence>

                {expiryProgress !== null && !isExpired && (
                  <div className="mx-auto h-1 max-w-76 overflow-hidden rounded-full bg-slate-100 dark:bg-(--surface-2)">
                    <div
                      className={`h-full rounded-full bg-linear-to-r transition-[width] duration-1000 ease-linear ${
                        isExpiringSoon ? "from-amber-400 to-orange-500" : "from-indigo-500 to-fuchsia-500"
                      }`}
                      style={{ width: `${expiryProgress * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isVerifying || isExpired || otpStatus === "success"}
                className={`mt-4 ${PRIMARY_BUTTON}`}
              >
                {otpStatus === "success" ? (
                  <>
                    <Check className="h-4 w-4" /> Verified
                  </>
                ) : isVerifying ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify email"
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-1.5 border-t border-slate-100 pt-5 text-sm dark:border-(--border-subtle)">
              <p className="text-slate-500 dark:text-(--text-muted)">Didn't get the code?</p>
              {secondsToResend > 0 ? (
                <p className="inline-flex items-center gap-2 font-medium text-slate-400 dark:text-(--text-muted)">
                  <CountdownRing progress={resendProgress} />
                  Resend available in
                  <span className="font-semibold tabular-nums text-slate-600 dark:text-(--text-primary)">
                    {formatClock(secondsToResend)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleResend()}
                  disabled={isResending}
                  className="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-70 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                >
                  <RotateCw
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isResending ? "animate-spin" : "group-hover:-rotate-90"
                    }`}
                  />
                  {isResending ? "Sending a new code…" : "Resend code"}
                </button>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500 dark:bg-(--surface-2) dark:text-(--text-muted)">
              <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>Can't find the email? Check your spam or promotions folder. Each code works only for a few minutes.</span>
            </div>
          </motion.div>
        )}

        {phase === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <EnvelopeBadge reduceMotion={reduceMotion} />
            <form className="mt-7 space-y-5" onSubmit={emailForm.handleSubmit(onEmailSubmit)} noValidate>
              <FormField
                id="verifyEmail"
                label="Email address"
                type="email"
                icon={<Mail className="h-5 w-5" />}
                autoComplete="email"
                placeholder="you@example.com"
                error={emailForm.formState.errors.email?.message}
                registration={emailForm.register("email")}
              />
              <Button type="submit" disabled={isResending} className={PRIMARY_BUTTON}>
                {isResending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Sending code…
                  </>
                ) : (
                  "Send verification code"
                )}
              </Button>
              {email && (
                <button
                  type="button"
                  onClick={() => setPhase("verify")}
                  className="w-full text-center text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-(--text-muted) dark:hover:text-indigo-300"
                >
                  I already have a code
                </button>
              )}
            </form>
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div
            key="success"
            className="py-2 text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SuccessMark reduceMotion={reduceMotion} />
            <h2 className="mt-7 text-lg font-semibold text-slate-900 dark:text-(--text-primary)">Welcome to Fixonest</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">
              <span className="break-all font-medium text-slate-700 dark:text-(--text-primary)">{email}</span> is confirmed.
              Log in to start booking trusted professionals.
            </p>
            <Button type="button" onClick={goToLogin} className={`group mt-7 ${PRIMARY_BUTTON}`}>
              Continue to log in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <p className="mt-3 text-xs text-slate-400 dark:text-(--text-muted)">
              Taking you there in <span className="tabular-nums">{redirectIn}</span>s…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
