import type { Metadata } from "next";
import { Syne, Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "onemock — one take. one mock. dead ready.",
  description:
    "Upload your resume and onemock runs a full 15-minute mock interview — timed, voiced, and scored on delivery, entirely in your browser.",
  icons: {
    icon: "/icon.svg",
  },
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
      <body className="bg-void text-paper font-body antialiased">{children}</body>
    </html>
  );
}
