import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone, Send, User } from "lucide-react";
import { FormField, TextareaField } from "@/components/common/form/index.js";
import { useAuth } from "@/features/auth/index.js";
import { submitContact } from "@/features/contact/index.js";
import { contactFormValidationSchema } from "../definitions/contactFormValidation.js";
import { officeInfoContent, officeInfoRows } from "../definitions/officeInfo.data.js";

const ICONS = { mapPin: MapPin, clock: Clock, mail: Mail, phone: Phone };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactFormSection() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  // A logged-in customer's name and email are filled in for them (still
  // editable); a guest gets an empty form. reset() below returns to these
  // same values, so they survive a successful send.
  const senderName = user?.fullName ?? "";
  const senderEmail = user?.email ?? "";
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormValidationSchema),
    defaultValues: { fullName: senderName, email: senderEmail, subject: "", message: "" },
  });

  // Logging out (or in) from the header leaves this page mounted, and
  // defaultValues are only read on mount - so follow the account here: the
  // previous customer's name and email are replaced straight away, without a
  // page refresh. A subject or message already typed is kept.
  useEffect(() => {
    resetField("fullName", { defaultValue: senderName });
    resetField("email", { defaultValue: senderEmail });
  }, [senderName, senderEmail, resetField]);

  // The form is only cleared once the backend has accepted the message, so a
  // failed send keeps what the customer typed.
  const onSubmit = async (values) => {
    try {
      const result = await dispatch(submitContact(values)).unwrap();
      toast.success(result.message);
      reset();
    } catch {
      // Already surfaced globally by lib/httpClient.js's response interceptor.
    }
  };

  return (
    <section className="pb-16 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20 sm:p-8"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
              Fill out the form and our team will get back to you soon.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

              <FormField
                id="subject"
                label="Subject"
                icon={<Mail className="h-5 w-5" />}
                placeholder="What's this about?"
                error={errors.subject?.message}
                registration={register("subject")}
              />

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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6 dark:border-(--border-subtle) dark:bg-(--surface-1)/40 sm:p-8"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">
              {officeInfoContent.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">{officeInfoContent.subtitle}</p>

            <div className="mt-6 space-y-5">
              {officeInfoRows.map((row) => {
                const Icon = ICONS[row.icon];
                return (
                  <div key={row.id} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm shadow-slate-200/70 dark:bg-(--surface-0) dark:text-indigo-400 dark:shadow-none">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-(--text-primary)">{row.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
