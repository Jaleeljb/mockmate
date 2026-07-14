import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Studio 15 — Mock Interview Practice",
  description:
    "Upload your resume and run a full 15-minute mock interview, timed and voiced right in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-ink text-paper font-body antialiased">{children}</body>
    </html>
  );
}
