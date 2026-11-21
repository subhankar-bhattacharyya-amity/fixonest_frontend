import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, ShieldCheck, TrendingUp } from "lucide-react";
import {
  aboutHeroContent,
  aboutHeroStats,
  aboutHeroQuote,
  aboutHeroFloatingBadges,
} from "../definitions/aboutHero.data.js";

const BADGE_ICONS = { shieldCheck: ShieldCheck, trendingUp: TrendingUp };
const BADGE_POSITION = ["-left-8 -top-8", "-right-6 -bottom-6"];

// Own local state so a broken photo never blocks the rest of the card.
function FounderAvatar() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
        RS
      </span>
    );
  }

  return (
    <img
      src={aboutHeroQuote.avatar}
      onError={() => setImageFailed(true)}
      alt={aboutHeroQuote.name}
      className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-(--surface-1)"
    />
  );
}

export default function AboutHeroSection() {
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
            {aboutHeroContent.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-5xl lg:text-6xl">
            {aboutHeroContent.titlePrefix}
            <span className="gradient-text-animate">{aboutHeroContent.titleHighlight}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-lg">
            {aboutHeroContent.subtitle}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-8 dark:border-(--border-subtle) sm:max-w-md">
            {aboutHeroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-(--text-muted) sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <div className="relative rounded-3xl border border-slate-100 bg-white p-7 shadow-2xl shadow-indigo-900/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30">
            <Quote className="h-8 w-8 text-indigo-200 dark:text-indigo-500/30" />

            <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-(--text-primary)">
              "{aboutHeroQuote.quote}"
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-(--border-subtle)">
              <FounderAvatar />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  {aboutHeroQuote.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-(--text-muted)">{aboutHeroQuote.title}</p>
              </div>
            </div>
          </div>

          {aboutHeroFloatingBadges.map((badge, index) => {
            const Icon = BADGE_ICONS[badge.icon];
            return (
              <motion.div
                key={badge.title}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                className={`absolute hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30 sm:flex ${BADGE_POSITION[index]}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{badge.title}</p>
                  <p className="text-xs text-slate-500 dark:text-(--text-muted)">{badge.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
