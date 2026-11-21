import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MessageCircleQuestion } from "lucide-react";
import { requestCtaContent } from "../definitions/requestCta.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function ServicesRequestCtaSection() {
  return (
    <section className="pb-16 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-fuchsia-50 p-8 dark:border-(--border-subtle) dark:from-(--surface-1) dark:via-(--surface-1) dark:to-(--surface-1) sm:p-10 lg:p-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />

          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm shadow-slate-200/70 dark:bg-(--surface-0) dark:text-indigo-400 dark:shadow-none">
                <MessageCircleQuestion className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-(--text-primary) sm:text-2xl">
                  {requestCtaContent.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-base">
                  {requestCtaContent.subtitle}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-(--text-muted)">
                  <Clock className="h-3.5 w-3.5" />
                  {requestCtaContent.note}
                </p>
              </div>
            </div>

            <motion.div
              className="w-full shrink-0 lg:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={requestCtaContent.cta.href}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 lg:w-auto sm:text-base"
              >
                {requestCtaContent.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
