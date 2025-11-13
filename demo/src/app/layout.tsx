import type { Metadata } from "next";
import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const fontSans = FontSans({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "tinyjson-parser - Fast, minimal JSON parser",
  description: "A lightweight, performant JSON parser built for modern applications",
  openGraph: {
    title: "tinyjson-parser - Fast, minimal JSON parser",
    description: "A lightweight, performant JSON parser built for modern applications",
    images: [
      {
        url: "https://tinyjson-parser.vercel.app/json.svg",
      },
    ],
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
        className={`${fontSans.variable} ${fontMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-white font-sans relative mx-auto max-w-6xl border border-black/10">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
