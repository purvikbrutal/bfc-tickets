"use client";

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const bodyStyle = {
  margin: 0,
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(180, 31, 50, 0.18), transparent 32%), radial-gradient(circle at 12% 18%, rgba(180, 31, 50, 0.08), transparent 24%), linear-gradient(180deg, #09090b 0%, #050507 42%, #040406 100%)",
  color: "#f6f6f8",
  fontFamily: '"Satoshi", "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
};

const mainStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const shellStyle = {
  width: "100%",
  maxWidth: "720px",
  textAlign: "center" as const,
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
  borderRadius: "999px",
  padding: "12px 20px",
  fontFamily: '"Clash Display", "SF Pro Display", "Avenir Next", ui-sans-serif, sans-serif',
  fontSize: "1.1rem",
  fontWeight: 600,
  letterSpacing: "0.22em",
};

const cardStyle = {
  marginTop: "32px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)), rgba(19, 19, 24, 0.72)",
  borderRadius: "32px",
  padding: "40px 28px",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 24px 80px rgba(0, 0, 0, 0.32)",
};

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.24em",
  textTransform: "uppercase" as const,
  color: "rgba(245, 245, 245, 0.82)",
};

const titleStyle = {
  margin: "24px 0 0",
  fontFamily: '"Clash Display", "SF Pro Display", "Avenir Next", ui-sans-serif, sans-serif',
  fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
  fontWeight: 600,
  letterSpacing: "-0.06em",
  lineHeight: 1,
};

const descriptionStyle = {
  maxWidth: "560px",
  margin: "16px auto 0",
  fontSize: "1rem",
  lineHeight: 1.8,
  color: "rgba(244, 244, 245, 0.7)",
};

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  gap: "12px",
  marginTop: "32px",
};

const primaryActionStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  border: "0",
  background: "#ffffff",
  color: "#000000",
  padding: "14px 24px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryActionStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "rgba(255, 255, 255, 0.84)",
  padding: "14px 24px",
  fontSize: "0.95rem",
  fontWeight: 600,
  textDecoration: "none",
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={bodyStyle}>
        <main style={mainStyle}>
          <div style={shellStyle}>
            <div style={badgeStyle}>BFC</div>

            <section style={cardStyle}>
              <p style={eyebrowStyle}>Site error</p>
              <h1 style={titleStyle}>Site error</h1>
              <p style={descriptionStyle}>
                Something went wrong while loading Brutal Fight Club. Refresh the page and try again. If the issue
                continues, return to the homepage and retry from there.
              </p>

              <div style={actionsStyle}>
                <button type="button" onClick={() => reset()} style={primaryActionStyle}>
                  Try Again
                </button>
                <Link href="/" style={secondaryActionStyle}>
                  Homepage
                </Link>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}
