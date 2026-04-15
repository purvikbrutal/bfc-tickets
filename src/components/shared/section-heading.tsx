import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  descriptionClassName?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  descriptionClassName,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-4", align === "center" ? "mx-auto text-center" : "", className)}>
      <span className="eyebrow">{eyebrow}</span>
      <div className="space-y-3">
        <h2 className="font-display text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className={cn("text-balance text-base leading-7 text-white/68 sm:text-lg", descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
