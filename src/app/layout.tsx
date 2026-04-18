import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import type { CSSProperties } from "react";

import "./globals.css";
import { SITE_METADATA } from "@/config/business";
import { TrackPageView } from "@/components/track-pageview";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!siteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
}

const fontshareSatoshiUrl = "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap";
const fontshareClashDisplayUrl = "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap";
const clashDisplaySemiboldWoff2 =
  "https://cdn.fontshare.com/wf/FPDAZ2S6SW4QMSRIIKNNGTPM6VIXYMKO/5HNPQ453FRLIQWV2FNOBUU3FKTDZQVSG/Z3MGHFHX6DCTLQ55LJYRJ5MDCZPMFZU6.woff2";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const rootFontStyle: CSSProperties = {
  ["--font-mono" as string]: 'var(--font-jetbrains-mono), "JetBrains Mono", "SFMono-Regular", ui-monospace, monospace',
};

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
    <html lang="en" className={jetbrainsMono.variable} style={rootFontStyle}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href={clashDisplaySemiboldWoff2}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={fontshareClashDisplayUrl} />
        <link rel="stylesheet" href={fontshareSatoshiUrl} />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <TrackPageView />
        {children}
      </body>
    </html>
  );
}
