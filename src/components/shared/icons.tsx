import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M7 3V7" strokeLinecap="round" />
      <path d="M17 3V7" strokeLinecap="round" />
      <path d="M3 9H21" strokeLinecap="round" />
      <rect x="3" y="5" width="18" height="16" rx="3" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M9 12L11.5 14.5L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15.5 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M6 6L18 18" strokeLinecap="round" />
      <path d="M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 7L12 13L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M12 21C15.5 16.8 18 13.8 18 10.4C18 6.87 15.31 4 12 4C8.69 4 6 6.87 6 10.4C6 13.8 8.5 16.8 12 21Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M4 7H20" strokeLinecap="round" />
      <path d="M4 12H20" strokeLinecap="round" />
      <path d="M4 17H20" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M6 4H9L10.5 8L8.5 10C9.7 12.5 11.5 14.3 14 15.5L16 13.5L20 15V18C20 19.1 19.1 20 18 20C10.27 20 4 13.73 4 6C4 4.9 4.9 4 6 4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M12 3L19 6V11C19 15.2 16.25 18.93 12 20C7.75 18.93 5 15.2 5 11V6L12 3Z" />
      <path d="M9.5 11.5L11.2 13.2L14.7 9.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z" strokeLinejoin="round" />
    </svg>
  );
}

export function TicketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn("size-5", className)}>
      <path d="M4 8A2 2 0 0 1 6 6H18A2 2 0 0 1 20 8V10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14V16A2 2 0 0 1 18 18H6A2 2 0 0 1 4 16V14C5.1 14 6 13.1 6 12C6 10.9 5.1 10 4 10V8Z" />
      <path d="M12 7V17" strokeLinecap="round" strokeDasharray="2.5 2.5" />
    </svg>
  );
}
