import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { ROUTES } from "@/routes/constants.js";

// Roughly the height of the Hero section on a typical viewport — shows
// once the user has scrolled past it, so the primary action stays
// reachable without repeating the Hero's own CTA the whole time.
const SCROLL_THRESHOLD = 480;

export default function QuickBookButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-40"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <AuthGatedLink
              to={ROUTES.SERVICES}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110"
            >
              <CalendarCheck className="h-4 w-4" />
              Book a service
            </AuthGatedLink>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
