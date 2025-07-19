"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ChevronDown, ChevronUp } from "lucide-react"
import type { Language, TranslationKey } from "@/lib/i18n"
import { getTranslation } from "@/lib/i18n"

interface QRStyleSelectorProps {
  language: Language
  qrLogo: string
  onLogoUpload: (file: File) => void
  onRemoveLogo: () => void
}

export default function QRStyleSelector({ language, qrLogo, onLogoUpload, onRemoveLogo }: QRStyleSelectorProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    logo: false,
  })

  const t = (key: TranslationKey) => getTranslation(language, key)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      onLogoUpload(file)
    }
  }

  return (
    <div className="space-y-3">
      {/* Logo Upload */}
      <Card className="border-gray-200">
        <CardHeader
          className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection("logo")}
        >
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              {language === "uk" ? "Логотип" : "Logo"}
              {qrLogo && <span className="text-xs text-green-600">✓</span>}
            </span>
            {expandedSections.logo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.logo && (
          <CardContent className="pt-0">
            {!qrLogo ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  {language === "uk" ? "Перетягніть файл або натисніть для вибору" : "Drag & drop or click to select"}
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" className="pointer-events-none bg-transparent">
                    {language === "uk" ? "Вибрати файл" : "Choose File"}
                  </Button>
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                <img
                  src={qrLogo || "/placeholder.svg"}
                  alt="Logo"
                  className="w-16 h-16 object-contain border rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {logoFile?.name || (language === "uk" ? "Логотип завантажено" : "Logo uploaded")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {logoFile?.size ? `${(logoFile.size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={onRemoveLogo}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
