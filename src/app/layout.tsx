import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { SITE_METADATA } from "@/config/business";
import { TrackPageView } from "@/components/track-pageview";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!siteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: siteUrl,
    siteName: SITE_METADATA.title,
    type: "website",
    images: [
      {
        url: "/ticket-image.png",
        alt: SITE_METADATA.openGraphImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: ["/ticket-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <TrackPageView />
        {children}
      </body>
    </html>
  );
}
