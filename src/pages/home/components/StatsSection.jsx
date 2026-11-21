import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { statsContent, stats } from "../definitions/stats.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Counts up from 0 to `value` once this element scrolls into view, using
// framer-motion's standalone `animate()` (a numeric tween, not tied to any
// element) to drive plain React state.
function AnimatedStat({ value, suffix, decimals = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (current) => setDisplay(current),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {decimals ? display.toFixed(decimals) : Math.floor(display).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            {statsContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {statsContent.title}
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:divide-x sm:divide-white/15">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
            >
              <p className="text-2xl font-extrabold tabular-nums text-white sm:text-4xl lg:text-5xl">
                <AnimatedStat value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </p>
              <p className="mt-2 text-sm font-medium text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
