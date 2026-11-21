import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck } from "lucide-react";
import { heroFloatingBadges } from "../definitions/hero.data.js";
import heroPhotoHexagon from "@/assets/hero-photo-hexagon.png";
import heroPhotoCollageMain from "@/assets/hero-photo-collage-main.png";
import heroPhotoCollageTop from "@/assets/hero-photo-collage-top.png";
import heroPhotoCollageBottom from "@/assets/hero-photo-collage-bottom.png";

const CROSSFADE_INTERVAL_MS = 3200;
const BADGE_ICONS = { shieldCheck: ShieldCheck, clock: Clock };
const BADGE_POSITION = ["-left-6 -top-6 sm:-left-8 sm:-top-8", "-right-4 -bottom-4 sm:-right-6 sm:-bottom-6"];

// Two "scenes" share the same slot and crossfade back and forth — a single
// framed portrait, then a 3-photo collage — instead of picking just one
// layout. Tile colors use our own indigo/fuchsia/amber accents rather than
// copying the reference site's orange theme, to stay on-brand.
export default function HeroVisualCrossfade() {
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScene((current) => (current + 1) % 2);
    }, CROSSFADE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="relative mx-auto aspect-4/5 w-full max-w-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      role="img"
      aria-label="Fixonest service professionals at work"
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
          activeScene === 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={heroPhotoHexagon}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain drop-shadow-2xl"
        />
      </div>

      <div
        className={`absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 transition-opacity duration-1000 ease-in-out sm:gap-4 ${
          activeScene === 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative row-span-2 overflow-hidden rounded-3xl bg-indigo-50 shadow-lg shadow-indigo-900/5 dark:bg-indigo-500/10">
          <img
            src={heroPhotoCollageMain}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[92%] w-auto -translate-x-1/2 object-contain"
          />
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-fuchsia-50 shadow-lg shadow-indigo-900/5 dark:bg-fuchsia-500/10">
          <img
            src={heroPhotoCollageTop}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain"
          />
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-amber-50 shadow-lg shadow-indigo-900/5 dark:bg-amber-500/10">
          <img
            src={heroPhotoCollageBottom}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain"
          />
        </div>
      </div>

      {heroFloatingBadges.map((badge, index) => {
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
  );
}
