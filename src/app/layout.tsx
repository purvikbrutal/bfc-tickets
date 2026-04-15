import type { Metadata } from "next";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Brutal Fight Club | Fight Night",
  description:
    "Premium single-event ticket booking website for Brutal Fight Club's Fight Night on April 26, 2026.",
  openGraph: {
    title: "Brutal Fight Club | Fight Night",
    description:
      "A sleek, cinematic boxing event landing page with premium ticket booking, payment flow, and digital ticket delivery.",
    url: siteUrl,
    siteName: "Brutal Fight Club",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brutal Fight Club | Fight Night",
    description:
      "Reserve your place for Fight Night on April 26, 2026. Premium booking flow, digital tickets, and elegant fight-night design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
