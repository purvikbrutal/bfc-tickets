import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { BUSINESS } from "@/config/business";

export function FooterSection() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="section-shell flex flex-col items-center gap-8 text-center sm:items-start sm:text-left lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-white/46">
            <span className="block sm:inline">{BUSINESS.contactEmail}</span>
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">{BUSINESS.contactPhone}</span>
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-3 text-center text-sm text-white/56 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:text-left lg:text-right">
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
