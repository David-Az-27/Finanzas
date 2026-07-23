import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DIMO — Finanzas Personales",
  description:
    "Administra tus finanzas personales: cuentas, ingresos, gastos y transferencias en un solo lugar.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#030712",
};

import Providers from "./providers";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="es"
        className={cn("h-full", inter.variable, geistMono.variable, "font-sans", geist.variable)}
      >
      <body className="bg-half-baked-950 text-half-baked-50 min-h-screen antialiased">
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
