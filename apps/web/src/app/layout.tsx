import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { StructuredData } from "../components/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Paper & Slate", template: "%s | Paper & Slate" },
  description:
    "Paper & Slate is an open education initiative of Glasscow LLC, building reusable public infrastructure for connected education.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feeds/rss.xml",
      "application/atom+xml": "/feeds/atom.xml",
      "application/feed+json": "/feeds/feed.json",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Paper & Slate",
    title: "Paper & Slate",
    description:
      "An open education initiative of Glasscow LLC building reusable infrastructure for connected education.",
    url: "/",
  },
  icons: { icon: "/brand/paper-and-slate-icon-dark-32.png" },
  robots:
    process.env.VERCEL_ENV === "preview" || process.env.PAPER_SLATE_ENV === "preview"
      ? { index: false, follow: false }
      : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StructuredData />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
