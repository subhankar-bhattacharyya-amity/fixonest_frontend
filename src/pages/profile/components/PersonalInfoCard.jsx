import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IdCard, Phone, User } from "lucide-react";
import { useAuth, updateProfile, updateProfileValidationSchema } from "@/features/auth/index.js";
import { FormField } from "@/components/common/form/index.js";

export default function PersonalInfoCard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateProfileValidationSchema),
    defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  // Keep the form's baseline in sync if the profile changes elsewhere (e.g.
  // a photo upload dispatches a fresh user object into the same slice) -
  // otherwise isDirty could stay stuck true/false against stale defaults.
  useEffect(() => {
    reset({ fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
  }, [user?.fullName, user?.phone, reset]);

  const onSubmit = async (values) => {
    try {
      const result = await dispatch(updateProfile(values)).unwrap();
      toast.success(result.message);
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30">
      <div className="flex items-start gap-4 p-6 sm:p-8 sm:pb-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <IdCard className="h-5 w-5" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-(--text-primary)">Personal information</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
            Update your name and phone number.
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-(--border-subtle)" />

      <form
        id="personal-info-form"
        className="flex flex-1 flex-col gap-5 p-6 sm:p-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          id="fullName"
          label="Full name"
          icon={<User className="h-5 w-5" />}
          autoComplete="name"
          error={errors.fullName?.message}
          registration={register("fullName")}
        />

        <FormField
          id="phone"
          label="Phone number"
          type="tel"
          icon={<Phone className="h-5 w-5" />}
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />
      </form>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-(--border-subtle) dark:bg-(--surface-2)/40 sm:px-8">
        <span className="text-xs text-slate-400 dark:text-(--text-muted)">
          {isDirty ? "You have unsaved changes" : "Everything's up to date"}
        </span>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-(--text-muted) dark:hover:text-(--text-primary)"
            >
              Discard
            </button>
          )}
          <button
            type="submit"
            form="personal-info-form"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
