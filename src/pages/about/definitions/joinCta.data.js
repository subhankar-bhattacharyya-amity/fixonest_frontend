// Dummy content for the About page's closing dual-CTA section
// (pages/about/components/AboutJoinCtaSection.jsx) — swap for real
// copy/links once a dedicated provider-signup flow exists.
export const joinCtaContent = {
  eyebrow: "Two sides, one mission",
  title: "Whichever side of the toolbox ",
  titleHighlight: "you're on, we've got you.",
  subtitle: "Fixonest works because both sides show up — customers who need help, and professionals who deliver it.",
};

export const joinCtaCards = [
  {
    id: "customer",
    icon: "home",
    title: "Looking for a service?",
    description: "Browse repair and household services, compare verified professionals, and book in minutes.",
    cta: { label: "Book a service", href: "/services", requiresAuth: true },
    gradient: "from-indigo-600 via-violet-600 to-fuchsia-600",
  },
  {
    id: "provider",
    icon: "wrench",
    title: "Are you a professional?",
    description: "Join our verified network of repair and household experts and grow your business with steady bookings.",
    cta: { label: "Get in touch", href: "/contact" },
    gradient: "from-slate-800 via-slate-900 to-slate-950",
  },
];
