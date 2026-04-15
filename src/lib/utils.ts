import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function buildTicketPagePath(bookingId: string, token: string) {
  return `/tickets/${bookingId}?token=${token}`;
}

export function buildTicketDownloadPath(bookingId: string, token: string) {
  return `/api/tickets/${bookingId}?token=${token}`;
}

export function buildAbsoluteUrl(pathname: string) {
  return `${getBaseUrl().replace(/\/$/, "")}${pathname}`;
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}
