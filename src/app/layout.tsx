import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://report-tembel.krya.global";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Teman Belajar",
    template: "%s | Teman Belajar",
  },
  description: "Session Recap & Monthly Report System for Mentors at Teman Belajar.",
  applicationName: "Teman Belajar",
  authors: [{ name: "Teman Belajar" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Teman Belajar",
    title: "Teman Belajar",
    description: "Session Recap & Monthly Report System for Mentors at Teman Belajar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Teman Belajar - Session Recap & Monthly Report for Mentors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teman Belajar",
    description: "Session Recap & Monthly Report System for Mentors at Teman Belajar.",
    images: ["/og-image.png"],
  },
};

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
