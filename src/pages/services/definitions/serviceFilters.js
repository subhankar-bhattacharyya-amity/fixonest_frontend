// Filter option constants for ServicesFilterSidebar.jsx — kept in their own
// file (not exported alongside the component) so Fast Refresh doesn't warn.
export const PRICE_RANGES = [
  { id: "any", label: "Any price" },
  { id: "under-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1500", label: "₹500 – ₹1,500", min: 500, max: 1500 },
  { id: "1500-3000", label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { id: "above-3000", label: "Above ₹3,000", min: 3000, max: Infinity },
];

export const RATING_OPTIONS = [
  { id: 0, label: "Any rating" },
  { id: 4, label: "4.0 & above" },
  { id: 4.5, label: "4.5 & above" },
];
