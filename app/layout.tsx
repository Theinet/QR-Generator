import type React from "react"
import type { Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { qrMetadata, SITE_URL } from "@/lib/seo"
import { headers } from "next/headers"
import { isLanguage, localeTags } from "@/lib/languages"
const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" })
export const metadata = qrMetadata("de")
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0b0b" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const requested = headers().get("x-qr-locale")
  const language = isLanguage(requested) ? requested : "de"
  return <html lang={localeTags[language]}><body className={inter.className}>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:p-3">{{ de: "Zum QR-Generator", fr: "Aller au générateur QR", it: "Vai al generatore QR", en: "Skip to QR generator", uk: "До генератора QR-кодів" }[language]}</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "WebApplication", name: "THE INET QR Code Generator",
      url: SITE_URL, applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
      browserRequirements: "Requires JavaScript", inLanguage: ["de-CH", "fr-CH", "it-CH", "en", "uk"], isAccessibleForFree: true,
      description: "Free QR code generator for websites, Wi-Fi, text, email, phone numbers, SMS and locations. Download PNG and SVG with custom colors and a logo.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
      creator: { "@type": "Organization", name: "THE INET", url: "https://www.theinet.ch", email: "contact@theinet.ch" },
      featureList: ["QR codes for websites, Wi-Fi, text, email, phone, SMS and locations", "PNG and SVG downloads", "Custom colors and logo", "Local browser generation without signup"],
    }) }} />
    {children}<Toaster />
  </body></html>
}
