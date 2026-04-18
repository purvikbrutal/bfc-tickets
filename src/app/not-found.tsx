import Link from "next/link";

import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,_#060608_0%,_#070709_38%,_#09080a_64%,_#050507_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,_rgba(180,31,50,0.24),_transparent_30%),radial-gradient(circle_at_50%_42%,_rgba(180,31,50,0.12),_transparent_40%)]" />

      <div className="section-shell relative flex min-h-screen flex-col items-center justify-center py-12 text-center sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/72 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/7"
        >
          <Logo compact className="text-lg tracking-[0.22em]" />
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/58">Brutal Fight Club</span>
        </Link>

        <section className="glass-panel mt-8 w-full max-w-2xl rounded-[34px] px-6 py-10 sm:mt-10 sm:px-10 sm:py-12">
          <p className="eyebrow">404</p>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            The page you were looking for is not available. Head back to the homepage to get back to Fight Night.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 hover:bg-white/92"
          >
            Back to Homepage
          </Link>
        </section>
      </div>
    </main>
  );
}
