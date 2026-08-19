import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { APP_CONFIG } from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://krishived-ai.vercel.app"),
  title: {
    default: `${APP_CONFIG.name} — Smart Agricultural Intelligence Platform`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description:
    "AI-Powered Smart Agricultural Platform delivering real-time crop disease diagnostics, weather telemetry, soil advisories, and harvest logging for farmers.",
  keywords: [
    "KrishiVed AI",
    "Smart Agriculture",
    "Crop Disease Diagnostics",
    "Weather Telemetry",
    "Soil Advisory",
    "Harvest Logging",
    "Precision Farming",
    "Indian Agriculture",
  ],
  authors: [{ name: "KrishiVed AI Team" }],
  openGraph: {
    title: "KrishiVed AI — Smart Agricultural Platform",
    description:
      "Empowering farmers with AI-driven crop diagnostics, weather telemetry, and intelligent yield analytics.",
    siteName: "KrishiVed AI",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={plusJakarta.variable}>
        <body className="font-sans bg-[#f8faf9] text-slate-900 antialiased min-h-screen selection:bg-emerald-500 selection:text-white mesh-bg">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

