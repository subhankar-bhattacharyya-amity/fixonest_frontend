import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { LinkedinIcon } from "@/components/common/icons/index.js";
import { fetchAboutTeam, useTeam } from "@/features/team/index.js";

// Section heading copy. The team members themselves come from the API
// (Super Admin managed) - see features/team.
const teamContent = {
  eyebrow: "Meet the team",
  title: "The people building ",
  titleHighlight: "Fixonest.",
  subtitle: "A small team obsessed with making home services feel effortless.",
};

// Cards wrap and centre, so 1-3 members (or a short last row) still look
// balanced instead of hugging the left edge.
const CARD_WIDTH_CLASS = "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]";
const CARD_CLASS =
  "flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm shadow-slate-200/60 transition hover:shadow-xl hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Own local state per card instance, so one broken photo never affects
// any other card. Falls back to gradient initials if there is no photo or
// it fails to load.
function TeamAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!member.avatar || imageFailed) {
    return (
      <span className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-xl font-semibold text-white">
        {member.initials}
      </span>
    );
  }

  return (
    <span className="block rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 p-1">
      <img
        src={member.avatar}
        onError={() => setImageFailed(true)}
        alt={member.name}
        className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-(--surface-1)"
      />
    </span>
  );
}

// Placeholder card with a team card's proportions, shown while loading.
function TeamCardSkeleton() {
  return (
    <div className={CARD_WIDTH_CLASS}>
      <div className={`${CARD_CLASS} animate-pulse`}>
        <div className="h-30 w-30 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-4 h-4 w-28 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-2 h-3 w-36 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
      </div>
    </div>
  );
}

export default function AboutTeamSection() {
  const dispatch = useDispatch();
  const { items: team, status } = useTeam().about;
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchAboutTeam());
  }, [dispatch]);

  // Nothing to show (no active members, or the request failed): hide the section.
  if (!isLoading && team.length === 0) return null;

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
            {teamContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {teamContent.title}
            <span className="gradient-text-animate">{teamContent.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {teamContent.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <TeamCardSkeleton key={index} />)
            : team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.45, delay: (index % 4) * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className={`${CARD_WIDTH_CLASS} ${CARD_CLASS}`}
                >
                  <TeamAvatar member={member} />

                  <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-(--text-primary) sm:text-base">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-(--text-muted) sm:text-sm">{member.role}</p>

                  {member.linkedin ? (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-indigo-400"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    // Same icon, not a link, so every card keeps the same height
                    // and look until the Super Admin adds the profile URL.
                    <span
                      aria-hidden="true"
                      className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 dark:border-(--border-subtle) dark:text-(--text-muted)"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </span>
                  )}
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
