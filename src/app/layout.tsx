import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingOverlay from "@/components/LoadingOverlay";

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overflow-x-hidden`}
      >
        <LoadingOverlay />
        {children}
      </body>
    </html>
  );
}
