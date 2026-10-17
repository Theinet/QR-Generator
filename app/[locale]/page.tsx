import { notFound } from "next/navigation"
import QRGenerator from "@/components/qr-generator"
import { isLanguage } from "@/lib/languages"
import { qrMetadata } from "@/lib/seo"

export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLanguage(params.locale)) return {}
  return qrMetadata(params.locale)
}

export default function LocalizedGenerator({ params }: { params: { locale: string } }) {
  if (!isLanguage(params.locale)) notFound()
  return <QRGenerator initialLanguage={params.locale} />
}
