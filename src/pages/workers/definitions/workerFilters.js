// Filter option constants for WorkersFilterSidebar.jsx — kept in their own
// file (not exported alongside the component) so Fast Refresh doesn't warn.
export const HOURLY_RATE_RANGES = [
  { id: "any", label: "Any rate" },
  { id: "under-250", label: "Under ₹250/hr", min: 0, max: 250 },
  { id: "250-350", label: "₹250 – ₹350/hr", min: 250, max: 350 },
  { id: "above-350", label: "Above ₹350/hr", min: 350, max: Infinity },
];

export const RATING_OPTIONS = [
  { id: 0, label: "Any rating" },
  { id: 4, label: "4.0 & above" },
  { id: 4.5, label: "4.5 & above" },
];
