import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingOverlay from "@/components/LoadingOverlay";
import TopGoldTicker from "@/components/TopGoldTicker";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ProfileCircle from "@/components/ProfileCircle";

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
    <html lang="es" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mp-public-key" content={process.env.MERCADO_PAGO_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? ''} />
        {/* Preload removido para minimizar Fast Data Transfer */}
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overflow-x-hidden notranslate`}
      >
        <LoadingOverlay />
        <ProfileCircle />
        <TopGoldTicker />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
