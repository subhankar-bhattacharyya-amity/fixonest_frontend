import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { heroContent, heroTrust } from "../definitions/hero.data.js";
import HeroVisualCrossfade from "./HeroVisualCrossfade.jsx";

// Own local state per avatar instance, so one broken image never affects
// any other avatar. Falls back to the gradient-initials badge if the
// photo fails to load — same pattern as TestimonialsSection's avatars.
function TrustAvatar({ avatar }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${avatar.gradient} text-xs font-semibold text-white shadow-sm ring-2 ring-black`}
      >
        {avatar.initials}
      </span>
    );
  }

  return (
    <img
      src={avatar.avatar}
      onError={() => setImageFailed(true)}
      alt=""
      className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-black"
    />
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-3 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {heroContent.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-5xl lg:text-6xl">
            {heroContent.titlePrefix}
            <span className="gradient-text-animate">{heroContent.titleHighlight}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-lg">
            {heroContent.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <AuthGatedLink
                to={heroContent.primaryCta.href}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 sm:w-auto sm:text-base"
              >
                {heroContent.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </AuthGatedLink>
            </motion.div>

            <a
              href={heroContent.secondaryCta.href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-primary) dark:hover:bg-(--surface-2) sm:w-auto sm:text-base"
            >
              {heroContent.secondaryCta.label}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3">
              {heroTrust.avatars.map((avatar) => (
                <TrustAvatar key={avatar.initials} avatar={avatar} />
              ))}
            </div>

            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1.5 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  {heroTrust.rating}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-(--text-muted)">
                {heroTrust.ratingCount} {heroTrust.reviewLabel}
              </p>
            </div>
          </div>
        </motion.div>

        <HeroVisualCrossfade />
      </div>
    </section>
  );
}
