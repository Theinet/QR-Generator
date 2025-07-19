"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Language, TranslationKey } from "@/lib/i18n"
import { getTranslation } from "@/lib/i18n"

interface QRPreviewProps {
  qrDataUrl: string
  title: string
  language: Language
  onDownloadPNG: () => void
  onDownloadSVG: () => void
}

export default function QRPreview({ qrDataUrl, title, language, onDownloadPNG, onDownloadSVG }: QRPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const t = (key: TranslationKey) => getTranslation(language, key)

  useEffect(() => {
    if (qrDataUrl) {
      setIsVisible(false)
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [qrDataUrl])

  if (!qrDataUrl) return null

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">{t("preview")}</h3>

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`transition-all duration-500 ease-out transform ${
              isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-100">
              <img
                src={qrDataUrl || "/placeholder.svg"}
                alt={title}
                className="w-64 h-64 mx-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button onClick={onDownloadPNG} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              {t("downloadPNG")}
            </Button>
            <Button
              onClick={onDownloadSVG}
              variant="outline"
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("downloadSVG")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
