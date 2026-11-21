import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Wrench } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { joinCtaContent, joinCtaCards } from "../definitions/joinCta.data.js";

const ICONS = { home: Home, wrench: Wrench };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutJoinCtaSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {joinCtaContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {joinCtaContent.title}
            <span className="gradient-text-animate">{joinCtaContent.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {joinCtaContent.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {joinCtaCards.map((card, index) => {
            const Icon = ICONS[card.icon];
            const CtaLink = card.cta.requiresAuth ? AuthGatedLink : Link;
            return (
              <motion.div
                key={card.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-3xl bg-linear-to-br p-8 text-white shadow-xl shadow-slate-900/10 sm:p-10 ${card.gradient}`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Icon className="h-7 w-7" />
                </span>

                <h3 className="mt-6 text-xl font-bold sm:text-2xl">{card.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">{card.description}</p>

                <CtaLink
                  to={card.cta.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition group-hover:bg-white/25"
                >
                  {card.cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </CtaLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
