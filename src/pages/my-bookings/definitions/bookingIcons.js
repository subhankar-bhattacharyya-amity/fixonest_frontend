import { AirVent, Droplets, Paintbrush, Sparkles, Wrench, Zap } from "lucide-react";

// Icon + tile colours for a booking without a photo (record.icon).
export const BOOKING_CATEGORY_ICONS = {
  plumbing: { icon: Droplets, className: "from-sky-400 to-blue-600" },
  electrical: { icon: Zap, className: "from-amber-400 to-orange-500" },
  appliance: { icon: AirVent, className: "from-indigo-400 to-violet-600" },
  cleaning: { icon: Sparkles, className: "from-emerald-400 to-teal-600" },
  painting: { icon: Paintbrush, className: "from-fuchsia-400 to-pink-600" },
  default: { icon: Wrench, className: "from-indigo-500 to-fuchsia-500" },
};
