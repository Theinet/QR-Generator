import type { Metadata } from "next"
import type { Language } from "./i18n"
import { languageCodes, localeTags } from "./languages"
export const SITE_URL = "https://qr.theinet.ch"
export const seoText = {
  de: { title: "Kostenloser QR-Code-Generator — PNG & SVG | THE INET", description: "QR-Codes für Websites, WLAN, Text, E-Mail und Telefon erstellen. Mit eigenen Farben und Logo. PNG oder SVG herunterladen, ohne Registrierung, direkt im Browser." },
  fr: { title: "Générateur de codes QR gratuit — PNG et SVG | THE INET", description: "Créez des codes QR pour liens, Wi-Fi, texte, e-mail et téléphone. Personnalisez les couleurs et le logo. Téléchargez le PNG ou le SVG sans inscription." },
  it: { title: "Generatore di codici QR gratuito — PNG e SVG | THE INET", description: "Crea codici QR per link, Wi-Fi, testo, e-mail e telefono. Personalizza colori e logo e scarica PNG o SVG senza registrazione, direttamente nel browser." },
  uk: { title: "Безкоштовний генератор QR-кодів онлайн — PNG та SVG | THE INET", description: "Створюйте QR-коди для посилань, Wi-Fi, тексту, email і телефону. Додавайте логотип, змінюйте кольори та завантажуйте PNG або SVG. Без реєстрації, у браузері." },
  en: { title: "Free QR Code Generator Online — PNG & SVG | THE INET", description: "Create free QR codes for links, Wi-Fi, text, email and phone numbers. Add a logo, customize colors and download PNG or SVG. No signup; generated in your browser." },
}
export function qrMetadata(language: Language): Metadata {
  const url = `${SITE_URL}/${language}`
  const alternates = Object.fromEntries(languageCodes.map((code) => [code === "de" || code === "fr" || code === "it" ? localeTags[code] : code, `${SITE_URL}/${code}`]))
  const ogLocales = { de: "de_CH", fr: "fr_CH", it: "it_CH", en: "en_GB", uk: "uk_UA" }
  return {
    metadataBase: new URL(SITE_URL), ...seoText[language], applicationName: "THE INET QR Generator",
    authors: [{ name: "THE INET", url: "https://www.theinet.ch" }], creator: "THE INET", publisher: "THE INET",
    robots: { index: true, follow: true },
    alternates: { canonical: url, languages: { ...alternates, "x-default": `${SITE_URL}/de` } },
    openGraph: { ...seoText[language], url, siteName: "THE INET QR Generator", type: "website", locale: ogLocales[language], alternateLocale: languageCodes.filter((code) => code !== language).map((code) => ogLocales[code]), images: [{ url: "/images/qr-generator-social.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", ...seoText[language], images: ["/images/qr-generator-social.png"] },
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  }
}
