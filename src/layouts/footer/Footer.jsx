import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight, Mail, X } from "lucide-react";
import { ROUTES } from "@/routes/constants.js";
import { footerBrand, footerColumns, footerSocialLinks, footerLegalLinks } from "./footer.data.js";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/common/icons/index.js";

const SOCIAL_ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, x: X, linkedin: LinkedinIcon };

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list — thanks for subscribing!");
    setEmail("");
  }

  return (
    <footer className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-base font-bold text-white shadow-md shadow-indigo-600/20">
                F
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">Fixonest</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{footerBrand.tagline}</p>

            <form className="mt-6 flex max-w-sm gap-2" onSubmit={handleSubscribe}>
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email"
                  aria-label="Email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                aria-label="Subscribe"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-600/20 transition hover:brightness-110"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>

            <div className="mt-6 flex items-center gap-2.5">
              {footerSocialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-sm text-slate-400 transition hover:text-white">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Fixonest. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {footerLegalLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-slate-500 transition hover:text-slate-300">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
