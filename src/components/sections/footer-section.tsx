import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const footerLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
] as const;

export function FooterSection() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="section-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-white/46">Contact placeholder: hello@brutalfightclub.com | +91 00000 00000</p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/56 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="premium-link">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
