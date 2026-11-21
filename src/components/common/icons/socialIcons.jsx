// lucide-react dropped every brand/platform logo (Facebook, Instagram,
// LinkedIn, the old Twitter bird) in the version this project uses — only
// the generic `X` glyph survived (see "select:X" in lucide-react's
// exports). These three recreate the well-known Feather-icons path data
// (lucide's own predecessor) with the exact same stroke conventions lucide
// itself uses (viewBox 24, stroke="currentColor", strokeWidth 2, round
// caps/joins), so they render identically to every other icon in the app.
// Shared under components/common/icons/ (not layouts/footer/) since both
// layouts/footer/Footer.jsx and pages/about's team section need them.
function SocialIconBase({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function FacebookIcon(props) {
  return (
    <SocialIconBase {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </SocialIconBase>
  );
}

export function InstagramIcon(props) {
  return (
    <SocialIconBase {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </SocialIconBase>
  );
}

export function LinkedinIcon(props) {
  return (
    <SocialIconBase {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </SocialIconBase>
  );
}
