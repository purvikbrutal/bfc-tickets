import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { BUSINESS } from "@/config/business";

export function FooterSection() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="section-shell flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-white/46">
            {BUSINESS.contactEmail} | {BUSINESS.contactPhone}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/56 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {BUSINESS.socialLinks.map((link) => (
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
