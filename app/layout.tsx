import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} | Next-Gen Agricultural Intelligence Platform`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description:
    "AI-Powered Smart Agricultural Platform offering real-time crop advisory, pest & disease diagnostics, and telemetry analytics.",
  keywords: [
    "Agriculture AI",
    "Smart Farming",
    "Crop Diagnostic AI",
    "Precision Agriculture",
    "KrishiVed AI",
  ],
  authors: [{ name: "KrishiVed AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans bg-[#f8faf9] text-slate-900 antialiased min-h-screen selection:bg-emerald-500 selection:text-white mesh-bg">
        {children}
      </body>
    </html>
  );
}
