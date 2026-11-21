import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useAuth, fetchProfile } from "@/features/auth/index.js";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { ProfileHero, PersonalInfoCard, ChangePasswordCard, SavedAddressesCard } from "./components/index.js";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  useDocumentTitle("Fixonest");
  const { user } = useAuth();
  const dispatch = useDispatch();

  // Login only returns the lean user object (no populated role) — refresh
  // with the full profile every time this page is visited.
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <motion.div {...cardMotion} transition={{ duration: 0.35, ease: "easeOut" }}>
        <ProfileHero />
      </motion.div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <motion.div {...cardMotion} transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}>
          <PersonalInfoCard />
        </motion.div>

        <motion.div {...cardMotion} transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}>
          <ChangePasswordCard />
        </motion.div>
      </div>

      <motion.div {...cardMotion} transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }} className="mt-6">
        <SavedAddressesCard />
      </motion.div>
    </div>
  );
}
