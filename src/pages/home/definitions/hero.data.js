// Dummy content for the Home page's Hero section (pages/home/components/HeroSection.jsx)
// — swap for real copy/stats once the business has them. Icon keys are
// mapped to lucide-react components inside the component itself, not
// stored here, since this file should stay plain data.
export const heroContent = {
  eyebrow: "Trusted by 10,000+ homeowners",
  titlePrefix: "Repair & household help, ",
  titleHighlight: "booked in minutes.",
  subtitle:
    "From leaky taps to full home cleaning, Fixonest connects you with verified, background-checked professionals for every repair and household service you need — on your schedule.",
  primaryCta: { label: "Book a service", href: "/services" },
  secondaryCta: { label: "How it works", href: "#how-it-works" },
};

// avatar uses pravatar.cc, a placeholder headshot service made for exactly
// this (mockup/demo avatar photos) — HeroSection falls back to the
// initials badge (gradient + initials) if a photo ever fails to load.
export const heroTrust = {
  rating: 4.9,
  ratingCount: "10,000+",
  reviewLabel: "happy customers",
  avatars: [
    { initials: "AK", gradient: "from-indigo-500 to-violet-500", avatar: "https://i.pravatar.cc/150?img=15" },
    { initials: "RS", gradient: "from-fuchsia-500 to-pink-500", avatar: "https://i.pravatar.cc/150?img=26" },
    { initials: "MP", gradient: "from-amber-500 to-orange-500", avatar: "https://i.pravatar.cc/150?img=33" },
    { initials: "TN", gradient: "from-emerald-500 to-teal-500", avatar: "https://i.pravatar.cc/150?img=44" },
  ],
};

// Floating trust badges overlaid on the Hero visual (HeroVisualCrossfade.jsx).
export const heroFloatingBadges = [
  { icon: "shieldCheck", title: "Verified pros", subtitle: "Background-checked" },
  { icon: "clock", title: "24/7 support", subtitle: "Always available" },
];
