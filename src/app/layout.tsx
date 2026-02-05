import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.store';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VoltSMS - Instant SMS Verification | Virtual Phone Numbers",
    template: "%s | VoltSMS",
  },
  description: "Get instant SMS verification codes with virtual phone numbers. Secure, private, and reliable service for all your verification needs. SOCKS5 proxies available.",
  keywords: ["SMS verification", "virtual phone number", "temporary phone number", "receive SMS online", "verification code", "privacy", "SOCKS5 proxy", "residential proxy"],
  authors: [{ name: "VoltSMS" }],
  creator: "VoltSMS",
  publisher: "VoltSMS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "VoltSMS",
    title: "VoltSMS - Instant SMS Verification | Virtual Phone Numbers",
    description: "Get instant SMS verification codes with virtual phone numbers. Secure, private, and reliable.",
    images: [
      {
        url: `${BASE_URL}/voltsms-logo.png`,
        width: 512,
        height: 512,
        alt: "VoltSMS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltSMS - Instant SMS Verification",
    description: "Get instant SMS verification codes with virtual phone numbers. Secure, private, and reliable.",
    images: [`${BASE_URL}/voltsms-logo.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "q8vXT-uGNovrHonR-uvvmjV4c89xiw5kR7egROV60wk",
  },
};

import Footer from "../components/Footer";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { OrganizationSchema, WebSiteSchema } from "../components/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
        <OrganizationSchema />
        <WebSiteSchema />
        <div className="relative z-10">
          <Footer />
        </div>
      </body>
    </html>
  );
}
