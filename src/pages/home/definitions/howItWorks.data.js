// Dummy content for the Home page's How It Works section
// (pages/home/components/HowItWorksSection.jsx). Icon keys are mapped to
// lucide-react components inside the component itself, not stored here.
export const howItWorksContent = {
  eyebrow: "How it works",
  title: "Booking a service takes ",
  titleHighlight: "less than a minute.",
  subtitle: "No phone calls, no waiting around — just a few taps from problem to solved.",
  cta: { label: "Book your first service", href: "/services" },
};

export const howItWorksSteps = [
  {
    id: 1,
    icon: "search",
    title: "Choose a service",
    description: "Browse repair or household services and tell us what you need.",
  },
  {
    id: 2,
    icon: "calendarCheck",
    title: "Pick a time slot",
    description: "Select a date and time that actually works for your schedule.",
  },
  {
    id: 3,
    icon: "userCheck",
    title: "Get matched with a pro",
    description: "A verified, background-checked professional is assigned to you.",
  },
  {
    id: 4,
    icon: "thumbsUp",
    title: "Relax, it's done",
    description: "Pay securely once the job's complete, then rate your experience.",
  },
];
