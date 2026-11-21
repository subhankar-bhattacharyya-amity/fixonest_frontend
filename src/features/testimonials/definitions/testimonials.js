import { appConfig } from "@/lib/config.js";

// backend/app/router/customer/testimonials.routes.js - public, read-only
// endpoint (no login needed). Returns only Active testimonials, managed by
// the Super Admin.
export const TESTIMONIALS_API_PATH = "/api/v1/testimonials";
export const HOME_TESTIMONIALS_LIMIT = 12;

// Card accents for the initials fallback badge / avatar ring, cycled by
// position so neighbouring cards differ.
const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-blue-500",
  "from-rose-500 to-red-500",
];

// avatar is either an upload path served by the backend
// ("uploads/testimonials/<file>") or an absolute http(s) URL. null when empty.
const buildAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `${appConfig.apiBaseUrl}/${avatar.replace(/^\/+/, "")}`;
};

const initialsOf = (name = "") => {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "?";
};

// Turns a testimonial from the API into the shape
// pages/home/components/TestimonialsSection.jsx renders.
export const toTestimonial = (testimonial, index) => ({
  id: testimonial._id,
  name: testimonial.name,
  location: testimonial.location ?? "",
  service: testimonial.service ?? "",
  rating: testimonial.rating,
  quote: testimonial.quote,
  avatar: buildAvatarUrl(testimonial.avatar),
  initials: initialsOf(testimonial.name),
  gradient: GRADIENTS[index % GRADIENTS.length],
});
