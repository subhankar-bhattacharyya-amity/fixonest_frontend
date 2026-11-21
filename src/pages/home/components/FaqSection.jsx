import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { fetchHomeFaqs, useFaq } from "@/features/faq/index.js";
import { ROUTES } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-(--text-primary) sm:text-base">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-(--surface-2) dark:text-(--text-muted)"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-(--text-muted) sm:px-8">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Placeholder rows with FaqItem's proportions, shown while the FAQs load.
function FaqItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between gap-4 px-6 py-5 sm:px-8">
      <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
      <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
    </div>
  );
}

export default function FaqSection() {
  const dispatch = useDispatch();
  const { items: faqs, status } = useFaq().home;
  // undefined = the user hasn't toggled anything yet, so the first FAQ is open.
  const [openId, setOpenId] = useState(undefined);
  const activeId = openId === undefined ? (faqs[0]?.id ?? null) : openId;
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchHomeFaqs());
  }, [dispatch]);

  // Nothing to show (no active FAQs, or the request failed): hide the section.
  if (!isLoading && faqs.length === 0) return null;

  return (
    <section className="bg-slate-50/70 py-16 dark:bg-(--surface-1)/40 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            Got questions?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            Frequently asked <span className="gradient-text-animate">questions.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            Everything you need to know before booking your first service.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 divide-y divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:divide-(--border-subtle) dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <FaqItemSkeleton key={index} />)
            : faqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={activeId === faq.id}
                  onToggle={() => setOpenId(activeId === faq.id ? null : faq.id)}
                />
              ))}
        </motion.div>

        <motion.p
          className="mt-8 text-center text-sm text-slate-500 dark:text-(--text-muted)"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          Still have questions?{" "}
          <Link
            to={ROUTES.CONTACT}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Contact us
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
