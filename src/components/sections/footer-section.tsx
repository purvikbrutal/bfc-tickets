import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const footerLinks = [
  { label: "Instagram", href: "https://www.instagram.com/purvik_brutal", external: true },
  { label: "YouTube", href: "https://www.youtube.com/@Purvik_Brutal", external: true },
  { label: "Terms", href: "/terms", external: false },
  { label: "Privacy", href: "/privacy", external: false },
] as const;

export function FooterSection() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="section-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-white/46">brutalfightclub@gmail.com | +91 7680895508</p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/56 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="premium-link"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
