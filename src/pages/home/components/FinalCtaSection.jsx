import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { finalCtaContent } from "../definitions/finalCta.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center shadow-2xl shadow-indigo-900/20 sm:px-12 sm:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-8 top-10 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:flex"
          >
            <Wrench className="h-5 w-5 text-white" />
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute bottom-10 right-10 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:flex"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.span>

          <span className="relative inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            {finalCtaContent.eyebrow}
          </span>

          <h2 className="relative mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {finalCtaContent.title}
          </h2>

          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {finalCtaContent.subtitle}
          </p>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <AuthGatedLink
                to={finalCtaContent.primaryCta.href}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:brightness-105 sm:w-auto sm:text-base"
              >
                {finalCtaContent.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </AuthGatedLink>
            </motion.div>

            <Link
              to={finalCtaContent.secondaryCta.href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:text-base"
            >
              {finalCtaContent.secondaryCta.label}
            </Link>
          </div>

          <p className="relative mt-6 text-xs font-medium text-white/70">{finalCtaContent.trustLine}</p>
        </motion.div>
      </div>
    </section>
  );
}
