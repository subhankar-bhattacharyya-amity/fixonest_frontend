import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Phone, Send, User } from "lucide-react";
import { FormField, TextareaField } from "@/components/common/form/index.js";
import { useAuth } from "@/features/auth/index.js";
import { submitProviderContact } from "@/features/contact/index.js";
import { useRequireAuth } from "@/routes/guards/useRequireAuth.js";
import { workerContactValidationSchema } from "../definitions/workerContactValidation.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function WorkerDetailsContactSection({ worker }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  // Only a logged-in customer can contact a provider - a guest's "Send
  // message" (click or Enter) goes to /login instead, and comes back to this
  // provider's page after signing in.
  const { isAuthenticated, requireAuth } = useRequireAuth();
  // A logged-in customer's name, email and phone are filled in for them
  // (still editable); a guest gets an empty form. reset() below returns to
  // these same values, so they survive a send. Same approach as the Contact
  // page's ContactFormSection.
  const senderName = user?.fullName ?? "";
  const senderEmail = user?.email ?? "";
  const senderPhone = user?.phone ?? "";
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workerContactValidationSchema),
    defaultValues: { fullName: senderName, email: senderEmail, phone: senderPhone, subject: "", message: "" },
  });

  // Logging in or out from the header leaves this page mounted, and
  // defaultValues are only read on mount - follow the account here. A
  // subject or message already typed is kept.
  useEffect(() => {
    resetField("fullName", { defaultValue: senderName });
    resetField("email", { defaultValue: senderEmail });
    resetField("phone", { defaultValue: senderPhone });
  }, [senderName, senderEmail, senderPhone, resetField]);

  // Sent to this provider (they see it in their admin panel's Contact page
  // and notification bell). The form is only cleared once the backend has
  // accepted it, so a failed send keeps what the customer typed.
  const onSubmit = async (values) => {
    try {
      const result = await dispatch(submitProviderContact({ ...values, provider_id: worker.id })).unwrap();
      toast.success(result.message);
      reset();
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    }
  };

  return (
    <section className="border-t border-slate-100 py-10 sm:py-14 lg:py-20 dark:border-(--border-subtle)">
      <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20 sm:p-8"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">Get In Touch</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
            Have a question before booking? Send {worker.firstName} a message directly.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={
              isAuthenticated
                ? handleSubmit(onSubmit)
                : (event) => {
                    event.preventDefault();
                    requireAuth(() => {})();
                  }
            }
            noValidate
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                id="phone"
                label="Phone number"
                type="tel"
                icon={<Phone className="h-5 w-5" />}
                autoComplete="tel"
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                registration={register("phone")}
              />
              <FormField
                id="subject"
                label="Subject"
                icon={<Mail className="h-5 w-5" />}
                placeholder="What's this about?"
                error={errors.subject?.message}
                registration={register("subject")}
              />
            </div>

            <TextareaField
              id="message"
              label="Message"
              placeholder="Tell us a bit more…"
              error={errors.message?.message}
              registration={register("message")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? "Sending…" : "Send message"}
              {!isSubmitting && <Send className="h-4 w-4" />}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
