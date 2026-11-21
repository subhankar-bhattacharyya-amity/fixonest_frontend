import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { changePassword, changePasswordValidationSchema } from "@/features/auth/index.js";
import { PasswordField } from "@/components/common/form/index.js";

export default function ChangePasswordCard() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(changePasswordValidationSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (values) => {
    try {
      const result = await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmNewPassword,
          confirmNewPassword: values.confirmNewPassword,
        }),
      ).unwrap();
      toast.success(result.message);
      reset();
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30">
      <div className="flex items-start gap-4 p-6 sm:p-8 sm:pb-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400">
          <KeyRound className="h-5 w-5" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-(--text-primary)">Change password</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
            Choose a strong password you don't use anywhere else.
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-(--border-subtle)" />

      <form
        id="change-password-form"
        className="flex flex-1 flex-col gap-5 p-6 sm:p-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <PasswordField
          id="currentPassword"
          label="Current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          registration={register("currentPassword")}
        />

        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          registration={register("newPassword")}
        />

        <PasswordField
          id="confirmNewPassword"
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          registration={register("confirmNewPassword")}
        />
      </form>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-(--border-subtle) dark:bg-(--surface-2)/40 sm:px-8">
        <span className="text-xs text-slate-400 dark:text-(--text-muted)">At least 8 characters, 1 letter &amp; 1 number</span>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-(--text-muted) dark:hover:text-(--text-primary)"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            form="change-password-form"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </section>
  );
}
