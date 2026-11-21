import { ROUTES } from "@/routes/constants.js";

// Dummy content for the site-wide Footer — swap for real links/copy once
// those pages/policies exist. Columns with a `#` href are placeholders for
// pages not built yet.
export const footerBrand = {
  tagline: "Repair and household help, booked in minutes. Verified professionals, transparent pricing, every time.",
};

export const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "Home", href: ROUTES.HOME },
      { label: "About us", href: ROUTES.ABOUT },
      { label: "Blog", href: ROUTES.BLOG },
      { label: "Contact", href: ROUTES.CONTACT },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All services", href: ROUTES.SERVICES },
      { label: "Repair services", href: ROUTES.SERVICES },
      { label: "Household services", href: ROUTES.SERVICES },
      { label: "Become a provider", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#" },
      { label: "Help center", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
    ],
  },
];

export const footerSocialLinks = [
  { label: "Facebook", icon: "facebook", href: "#" },
  { label: "Instagram", icon: "instagram", href: "#" },
  { label: "X", icon: "x", href: "#" },
  { label: "LinkedIn", icon: "linkedin", href: "#" },
];

export const footerLegalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Sitemap", href: "#" },
];
