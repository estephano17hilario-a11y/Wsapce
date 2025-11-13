import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingOverlay from "@/components/LoadingOverlay";
import TopGoldTicker from "@/components/TopGoldTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wspace - El Viaje Cinematográfico",
  description: "Una experiencia narrativa inmersiva inspirada en GTA 6. Viaja desde lo personal hasta Andrómeda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload de imágenes críticas para primer render */}
        <link rel="preload" as="image" href="/andromeda up - copia.webp" />
        <link rel="preload" as="image" href="/espacio azul up - copia.webp" />
        <link rel="preload" as="image" href="/persona sun up - copia.webp" />
        <link rel="preload" as="image" href="/perxonas up - copia.webp" />
        <link rel="preload" as="image" href="/tierra para implementar - copia - copia.webp" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <>
            <link rel="dns-prefetch" href="https://plausible.io" />
            <link rel="preconnect" href="https://plausible.io" />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.tagged-events.js"
          />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overflow-x-hidden`}
      >
        <LoadingOverlay />
        <TopGoldTicker />
        {children}
      </body>
    </html>
  );
}
