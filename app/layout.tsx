import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import AuthProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "Flot - Commerce without friction",
  description:
    "Multi-vertical commerce platform. Four verticals: Hotel, Restaurant, Travel & Store. One checkout, zero friction.",
  metadataBase: new URL("https://flot-platform.vercel.app"),
  openGraph: {
    title: "Flot - Commerce without friction",
    description:
      "Four verticals: Hotel, Restaurant, Travel & Store. One checkout, zero friction.",
    url: "https://flot-platform.vercel.app",
    siteName: "Flot Platform",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flot - Commerce without friction",
    description:
      "Four verticals: Hotel, Restaurant, Travel & Store. One checkout, zero friction.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} ${cormorant.variable} ${montserrat.variable} ${jetbrains.variable}`}>
      <body className="grain antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
