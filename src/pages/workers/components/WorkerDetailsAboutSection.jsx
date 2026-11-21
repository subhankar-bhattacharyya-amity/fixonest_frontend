import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Tags } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// A category's uploaded icon, or a generic glyph if it has none (or it fails
// to load).
function ExpertiseIcon({ category }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(category.icon) && !failed;
  return (
    <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
      {showImage ? (
        <img
          src={category.icon}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Tags className="h-6 w-6" />
      )}
    </span>
  );
}

// Service Details (the provider's bio), Areas of Experience (the categories
// they picked on their profile) and Why Book (their own points). Each block is
// only shown once the provider has filled it in.
export default function WorkerDetailsAboutSection({ worker }) {
  const blocks = [
    worker.bio && "details",
    worker.expertise.length > 0 && "expertise",
    worker.whyBook.length > 0 && "whyBook",
  ].filter(Boolean);

  if (blocks.length === 0) return null;

  // Every block after the first gets the divider above it.
  const blockClass = (name) =>
    blocks.indexOf(name) > 0 ? "mt-10 border-t border-slate-100 pt-10 dark:border-(--border-subtle)" : "";

  return (
    <section className="py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
        {worker.bio && (
          <motion.div
            className={blockClass("details")}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
              Service Details
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600 dark:text-(--text-muted)">
              {worker.bio}
            </p>
          </motion.div>
        )}

        {worker.expertise.length > 0 && (
          <motion.div
            className={blockClass("expertise")}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
              Areas of Experience
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-(--text-muted)">
              {worker.designation
                ? `Primarily works in ${worker.designation.toLowerCase()}, and ${worker.firstName} is also experienced with these services.`
                : `${worker.firstName} is experienced with these services.`}
            </p>

            <div className="mt-6 flex flex-wrap items-start gap-4 sm:gap-6">
              {worker.expertise.map((category) => (
                <div key={category.id} className="flex flex-col items-center gap-2 text-center">
                  <ExpertiseIcon category={category} />
                  <span className="max-w-16 text-xs text-slate-500 dark:text-(--text-muted)">{category.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {worker.whyBook.length > 0 && (
          <motion.div
            className={blockClass("whyBook")}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
              Why Book {worker.firstName}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {worker.whyBook.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
