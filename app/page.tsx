"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Download,
  Copy,
  QrCode,
  Globe,
  Phone,
  MessageSquare,
  Calendar,
  Mail,
  MessageCircle,
  Wifi,
  MapPin,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import { translations, type Language, type TranslationKey, getTranslation } from "@/lib/i18n"
import { secureStorage } from "@/lib/encryption"
import Header from "@/components/header"
import Footer from "@/components/footer"
import QRPreview from "@/components/qr-preview"
import PrivacyModal from "@/components/privacy-modal"
import QRStyleSelector from "@/components/qr-style-selector"

interface QRCodeData {
  id: string
  type: string
  content: string
  title: string
  createdAt: Date
  expiresAt: Date | null
  qrCodeDataUrl: string
  qrStyle: string
  additionalData?: Record<string, string>
}

const contentTypes = [
  { value: "text", icon: MessageSquare },
  { value: "website", icon: Globe },
  { value: "email", icon: Mail },
  { value: "phone", icon: Phone },
  { value: "sms", icon: MessageCircle },
  { value: "wifi", icon: Wifi },
  { value: "location", icon: MapPin },
]

export default function QRGenerator() {
  const [language, setLanguage] = useState<Language>("uk")
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [currentQRPreview, setCurrentQRPreview] = useState<string>("")
  const [formData, setFormData] = useState({
    type: "text",
    content: "",
    title: "",
    expirationDays: "30",
    qrSize: "256",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    transparentBackground: false,
    qrLogo: "" as string,
    password: "",
    subject: "",
    message: "",
  })
  const { toast } = useToast()
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const t = (key: TranslationKey) => getTranslation(language, key)

  // Load data from encrypted localStorage on mount
  useEffect(() => {
    const savedLanguage = secureStorage.getItem("qr-language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }

    const savedSettings = secureStorage.getItem("qr-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Error loading settings from encrypted storage:", error)
      }
    }

    const savedQRCodes = secureStorage.getItem("qr-codes")
    if (savedQRCodes) {
      try {
        const parsed = JSON.parse(savedQRCodes).map((qr: any) => ({
          ...qr,
          createdAt: new Date(qr.createdAt),
          expiresAt: qr.expiresAt ? new Date(qr.expiresAt) : null,
        }))
        setQrCodes(parsed)
      } catch (error) {
        console.error("Error loading QR codes from encrypted storage:", error)
      }
    }
  }, [])

  // Save language preference with encryption
  useEffect(() => {
    secureStorage.setItem("qr-language", language)
  }, [language])

  // Save settings with encryption
  useEffect(() => {
    const settings = {
      qrSize: formData.qrSize,
      foregroundColor: formData.foregroundColor,
      backgroundColor: formData.backgroundColor,
    }
    secureStorage.setItem("qr-settings", JSON.stringify(settings))
  }, [formData.qrSize, formData.foregroundColor, formData.backgroundColor])

  // Save to encrypted localStorage when changed
  useEffect(() => {
    secureStorage.setItem("qr-codes", JSON.stringify(qrCodes))
  }, [qrCodes])

  const generateQRContent = () => {
    let qrContent = formData.content

    switch (formData.type) {
      case "phone":
        qrContent = `tel:${formData.content}`
        break
      case "website":
        if (!formData.content.startsWith("http://") && !formData.content.startsWith("https://")) {
          qrContent = `https://${formData.content}`
        }
        break
      case "email":
        qrContent = `mailto:${formData.content}`
        if (formData.subject) qrContent += `?subject=${encodeURIComponent(formData.subject)}`
        if (formData.message) qrContent += `${formData.subject ? "&" : "?"}body=${encodeURIComponent(formData.message)}`
        break
      case "sms":
        qrContent = `sms:${formData.content}`
        if (formData.message) qrContent += `?body=${encodeURIComponent(formData.message)}`
        break
      case "wifi":
        qrContent = `WIFI:T:WPA;S:${formData.content};P:${formData.password};H:false;;`
        break
      case "location":
        const coords = formData.content.split(",")
        if (coords.length === 2) {
          qrContent = `geo:${coords[0].trim()},${coords[1].trim()}`
        }
        break
      case "text":
      default:
        qrContent = formData.content
        break
    }

    return qrContent
  }

  const addLogoToQR = (qrDataUrl: string, logoDataUrl: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve(qrDataUrl)
        return
      }

      const qrImg = new Image()
      qrImg.crossOrigin = "anonymous"
      qrImg.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, size, size)

        // Load and draw logo
        const logoImg = new Image()
        logoImg.crossOrigin = "anonymous"
        logoImg.onload = () => {
          const logoSize = size * 0.2
          const x = (size - logoSize) / 2
          const y = (size - logoSize) / 2

          // Draw white background circle for logo
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, logoSize * 0.6, 0, 2 * Math.PI)
          ctx.fill()

          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize)

          resolve(canvas.toDataURL())
        }
        logoImg.onerror = () => resolve(qrDataUrl)
        logoImg.src = logoDataUrl
      }
      qrImg.onerror = () => resolve(qrDataUrl)
      qrImg.src = qrDataUrl
    })
  }

  const generateQRCode = async () => {
    if (!formData.content.trim() || !formData.title.trim()) {
      toast({
        title: t("error"),
        description: t("fillRequired"),
        variant: "destructive",
      })
      return
    }

    try {
      const qrContent = generateQRContent()
      const size = Number.parseInt(formData.qrSize)

      // Generate base QR code
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: "M",
        width: size,
        color: {
          dark: formData.foregroundColor,
          light: formData.transparentBackground ? "#00000000" : formData.backgroundColor,
        },
      })

      let finalQRDataUrl = qrDataUrl

      // Add logo if provided
      if (formData.qrLogo) {
        finalQRDataUrl = await addLogoToQR(qrDataUrl, formData.qrLogo, size)
      }

      setCurrentQRPreview(finalQRDataUrl)

      const expiresAt =
        formData.expirationDays === "never"
          ? null
          : new Date(Date.now() + Number.parseInt(formData.expirationDays) * 24 * 60 * 60 * 1000)

      const newQRCode: QRCodeData = {
        id: Date.now().toString(),
        type: formData.type,
        content: formData.content,
        title: formData.title,
        createdAt: new Date(),
        expiresAt,
        qrCodeDataUrl: finalQRDataUrl,
        qrStyle: formData.qrLogo ? "with-logo" : "classic",
        additionalData: {
          password: formData.password,
          subject: formData.subject,
          message: formData.message,
        },
      }

      setQrCodes((prev) => [newQRCode, ...prev])

      toast({
        title: t("success"),
        description: t("successDesc"),
      })
    } catch (error: any) {
      console.error("QR Generation Error:", error)
      toast({
        title: t("error"),
        description: t("errorDesc") + ": " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    }
  }

  const handleLogoUpload = (file: File) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string
        setFormData((prev) => ({ ...prev, qrLogo: logoDataUrl }))
      }
      reader.onerror = () => {
        toast({
          title: t("error"),
          description: language === "uk" ? "Не вдалося завантажити логотип" : "Failed to load logo",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: t("error"),
        description: language === "uk" ? "Файл занадто великий (макс. 5 МБ)" : "File too large (max 5 MB)",
        variant: "destructive",
      })
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, qrLogo: "" }))
  }

  const downloadQRCode = (qrCode: QRCodeData, format: "png" | "svg" = "png") => {
    if (format === "png") {
      const link = document.createElement("a")
      link.download = `${qrCode.title}.png`
      link.href = qrCode.qrCodeDataUrl
      link.click()
    } else {
      const qrContent = generateQRContent()
      QRCode.toString(qrContent, { type: "svg", width: 256 }, (err, svg) => {
        if (!err) {
          const blob = new Blob([svg], { type: "image/svg+xml" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = `${qrCode.title}.svg`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        } else {
          toast({
            title: t("error"),
            description: language === "uk" ? "Не вдалося завантажити SVG" : "Failed to download SVG",
            variant: "destructive",
          })
        }
      })
    }
  }

  const downloadCurrentQR = (format: "png" | "svg") => {
    if (!currentQRPreview) return

    if (format === "png") {
      const link = document.createElement("a")
      link.download = `${formData.title || "qr-code"}.png`
      link.href = currentQRPreview
      link.click()
    } else {
      const qrContent = generateQRContent()
      QRCode.toString(qrContent, { type: "svg", width: Number.parseInt(formData.qrSize) }, (err, svg) => {
        if (!err) {
          const blob = new Blob([svg], { type: "image/svg+xml" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.download = `${formData.title || "qr-code"}.svg`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        } else {
          toast({
            title: t("error"),
            description: language === "uk" ? "Не вдалося завантажити SVG" : "Failed to download SVG",
            variant: "destructive",
          })
        }
      })
    }
  }

  const deleteQRCode = (id: string) => {
    setQrCodes((prev) => prev.filter((qr) => qr.id !== id))
    toast({
      title: t("deleted"),
      description: t("deletedDesc"),
    })
  }

  const copyQRCodeToClipboard = async (qrDataUrl: string) => {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      toast({
        title: t("error"),
        description: t("browserNotSupportedCopyImage"),
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      toast({
        title: t("copied"),
        description: t("copiedDesc"),
      })
    } catch (error) {
      console.error("Failed to copy image:", error)
      toast({
        title: t("error"),
        description: t("failedToCopyQR"),
        variant: "destructive",
      })
    }
  }

  const isExpired = (qrCode: QRCodeData) => {
    return qrCode.expiresAt && new Date() > qrCode.expiresAt
  }

  const getTypeIcon = (type: string) => {
    const contentType = contentTypes.find((ct) => ct.value === type)
    return contentType ? contentType.icon : QrCode
  }

  const renderAdditionalFields = () => {
    switch (formData.type) {
      case "email":
        return (
          <>
            <div>
              <Label htmlFor="subject">{t("subject")}</Label>
              <Input
                id="subject"
                placeholder={t("subject")}
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="message">{t("message")}</Label>
              <Textarea
                id="message"
                placeholder={t("message")}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </>
        )
      case "sms":
        return (
          <div>
            <Label htmlFor="message">{t("message")}</Label>
            <Textarea
              id="message"
              placeholder={t("message")}
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>
        )
      case "wifi":
        return (
          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
        )
      default:
        return null
    }
  }

  const getPlaceholder = (type: string) => {
    return t(`${type}Placeholder` as TranslationKey)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header language={language} setLanguage={setLanguage} />

      <div className="pt-20 sm:pt-24 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="xl:col-span-2">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <QrCode className="w-5 h-5" />
                    {t("createQR")}
                  </CardTitle>
                  <CardDescription className="text-sm">{t("fillForm")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        {t("name")} *
                      </Label>
                      <Input
                        id="title"
                        placeholder={t("namePlaceholder")}
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm font-medium">
                        {t("contentType")}
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {t(type.value as TranslationKey)}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-sm font-medium">
                      {t("content")} *
                    </Label>
                    {formData.type === "text" ? (
                      <Textarea
                        id="content"
                        placeholder={getPlaceholder(formData.type)}
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <Input
                        id="content"
                        placeholder={getPlaceholder(formData.type)}
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        className="mt-1"
                      />
                    )}
                  </div>

                  {renderAdditionalFields()}

                  <QRStyleSelector
                    language={language}
                    qrLogo={formData.qrLogo}
                    onLogoUpload={handleLogoUpload}
                    onRemoveLogo={removeLogo}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="qrSize" className="text-sm font-medium">
                        {t("qrSize")}
                      </Label>
                      <Select
                        value={formData.qrSize}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, qrSize: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="128">{t("small")}</SelectItem>
                          <SelectItem value="256">{t("medium")}</SelectItem>
                          <SelectItem value="512">{t("large")}</SelectItem>
                          <SelectItem value="1024">{t("xlarge")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="foregroundColor" className="text-sm font-medium">
                        {t("foregroundColor")}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="foregroundColor"
                          type="color"
                          value={formData.foregroundColor}
                          onChange={(e) => setFormData((prev) => ({ ...prev, foregroundColor: e.target.value }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.foregroundColor}
                          onChange={(e) => setFormData((prev) => ({ ...prev, foregroundColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="backgroundColor" className="text-sm font-medium">
                        {t("backgroundColor")}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="transparentBackground" className="text-sm font-medium">
                        {language === "uk" ? "Прозорий фон" : "Transparent"}
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          id="transparentBackground"
                          type="checkbox"
                          checked={formData.transparentBackground || false}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, transparentBackground: e.target.checked }))
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-xs text-gray-600">
                          {language === "uk" ? "Без фону" : "No background"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiration" className="text-sm font-medium">
                      {t("expiration")}
                    </Label>
                    <Select
                      value={formData.expirationDays}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, expirationDays: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t("oneDay")}</SelectItem>
                        <SelectItem value="7">{t("sevenDays")}</SelectItem>
                        <SelectItem value="30">{t("thirtyDays")}</SelectItem>
                        <SelectItem value="90">{t("ninetyDays")}</SelectItem>
                        <SelectItem value="365">{t("oneYear")}</SelectItem>
                        <SelectItem value="never">{t("never")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateQRCode}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 min-h-[44px]"
                  >
                    {t("create")}
                  </Button>
                </CardContent>
              </Card>

              <QRPreview
                qrDataUrl={currentQRPreview}
                title={formData.title}
                language={language}
                onDownloadPNG={() => downloadCurrentQR("png")}
                onDownloadSVG={() => downloadCurrentQR("svg")}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                {t("createdQRs")} ({qrCodes.length})
              </h2>

              {qrCodes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-6 sm:py-8">
                    <QrCode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm">{t("noQRCodes")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
                  {qrCodes.map((qrCode) => {
                    const Icon = getTypeIcon(qrCode.type)
                    return (
                      <Card key={qrCode.id} className={isExpired(qrCode) ? "opacity-50" : ""}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col items-start gap-3 sm:gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 w-full">
                              <div className="flex-shrink-0">
                                <img
                                  src={qrCode.qrCodeDataUrl || "/placeholder.svg"}
                                  alt={qrCode.title}
                                  className="w-12 h-12 sm:w-16 sm:h-16 border rounded object-contain bg-white"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=64&width=64"
                                  }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                  <h3 className="font-semibold truncate text-sm sm:text-base">{qrCode.title}</h3>
                                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    <Icon className="w-3 h-3" />
                                    {t(qrCode.type as TranslationKey)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {qrCode.qrStyle}
                                  </Badge>
                                  {isExpired(qrCode) && (
                                    <Badge variant="destructive" className="text-xs">
                                      {t("expired")}
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-xs sm:text-sm text-gray-600 truncate mb-1 sm:mb-2">
                                  {qrCode.content}
                                </p>

                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {qrCode.createdAt.toLocaleDateString(language === "uk" ? "uk-UA" : "en-US")}
                                  </span>
                                  {qrCode.expiresAt && (
                                    <span>
                                      {t("expires")}:{" "}
                                      {qrCode.expiresAt.toLocaleDateString(language === "uk" ? "uk-UA" : "en-US")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(qrCode, "png")}
                                className="flex-1 min-w-[100px] text-xs min-h-[36px] justify-center"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                PNG
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(qrCode, "svg")}
                                className="flex-1 min-w-[100px] text-xs min-h-[36px] justify-center"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                SVG
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyQRCodeToClipboard(qrCode.qrCodeDataUrl)} // Changed to copy QR code image
                                className="flex-1 min-w-[100px] text-xs min-h-[36px] justify-center"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                {t("copy")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteQRCode(qrCode.id)}
                                className="flex-1 min-w-[100px] text-red-600 hover:text-red-700 text-xs min-h-[36px] justify-center"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {t("delete")}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <Card className="mt-6 sm:mt-8 bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800 mb-1 text-sm sm:text-base">{t("privacy")}</h4>
                  <p className="text-xs sm:text-sm text-green-700">{t("privacyDesc")}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivacyModal(true)}
                  className="flex items-center gap-1 sm:gap-2 border-green-300 text-green-700 hover:bg-green-100 text-xs min-h-[36px]"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  {language === "uk" ? "Детальніше" : "Learn More"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer language={language} />

      <PrivacyModal language={language} isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}
