import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-display text-2xl font-semibold tracking-[0.26em] text-white",
        compact ? "text-xl" : "text-2xl sm:text-[1.7rem]",
        className,
      )}
    >
      BFC
    </span>
  );
}
