import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host.startsWith("localhost")
      ? "http"
      : "https";
  const origin = new URL(`${protocol}://${host}`);
  const title = "Skillpath — Practical skills. Real momentum.";
  const description = "Live, practical courses with region-aware pricing and resilient recovery when the network gets messy.";

  return {
    metadataBase: origin,
    title,
    description,
    applicationName: "Skillpath",
    keywords: ["practical courses", "creator skills", "career learning", "Skillpath"],
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [{ url: new URL("/og.png", origin), width: 1200, height: 630, alt: "Skillpath — Practical skills. Real momentum." }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", origin)],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
