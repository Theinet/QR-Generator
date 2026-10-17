"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { localeTags } from "@/lib/languages"
import { encodeQRContent, QRContentError } from "@/lib/qr-content"
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
import GeneratorGuide from "@/components/generator-guide"
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
  qrStyle: string // Simplified to just "classic" or "classic-with-logo"
  encodedContent?: string
  exportOptions?: { size: number; foreground: string; background: string; logo: string }
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

export default function QRGenerator({ initialLanguage = "de" }: { initialLanguage?: Language }) {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [hydrated, setHydrated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentQRCode, setCurrentQRCode] = useState<QRCodeData | null>(null)
  const changeLanguage = (next: Language) => {
    setLanguage(next)
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    try { localStorage.setItem("qr-language", next) } catch {}
    router.push(`/${next}${window.location.search}${window.location.hash}`, { scroll: false })
  }
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [currentQRPreview, setCurrentQRPreview] = useState<string>("")
  const [formData, setFormData] = useState({
    type: "text",
    content: "",
    title: "",
    expirationDays: "never",
    qrSize: "256",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    qrLogo: "" as string, // Only logo remains for styling
    // Additional fields for different types
    password: "",
    subject: "",
    message: "",
  })
  const { toast } = useToast()
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const t = (key: TranslationKey) => getTranslation(language, key)

  useEffect(() => {
    setLanguage(initialLanguage)
    document.documentElement.lang = localeTags[initialLanguage]
  }, [initialLanguage])

  // Load before saving: an empty initial render must never erase history.
  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("qr-settings") || "null")
      if (settings && typeof settings === "object") {
        setFormData((prev) => ({ ...prev,
          qrSize: ["128", "256", "512", "1024"].includes(settings.qrSize) ? settings.qrSize : prev.qrSize,
          foregroundColor: /^#[0-9a-f]{6}$/i.test(settings.foregroundColor) ? settings.foregroundColor : prev.foregroundColor,
          backgroundColor: /^#[0-9a-f]{6}$/i.test(settings.backgroundColor) ? settings.backgroundColor : prev.backgroundColor,
        }))
      }
    } catch { /* Storage may be unavailable or contain invalid JSON. */ }
    try {
      const stored = JSON.parse(localStorage.getItem("qr-codes") || "[]")
      if (Array.isArray(stored)) setQrCodes(stored.filter((qr) => qr && typeof qr.id === "string" && typeof qr.title === "string" && typeof qr.content === "string" && typeof qr.type === "string" && typeof qr.qrCodeDataUrl === "string" && qr.qrCodeDataUrl.startsWith("data:image/png") && !Number.isNaN(Date.parse(qr.createdAt))).map((qr) => ({
        ...qr, createdAt: new Date(qr.createdAt),
        expiresAt: qr.expiresAt && !Number.isNaN(Date.parse(qr.expiresAt)) ? new Date(qr.expiresAt) : null,
      })))
    } catch { /* Keep the generator usable without browser storage. */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem("qr-settings", JSON.stringify({ qrSize: formData.qrSize, foregroundColor: formData.foregroundColor, backgroundColor: formData.backgroundColor }))
    } catch { /* Settings are optional. */ }
  }, [hydrated, formData.qrSize, formData.foregroundColor, formData.backgroundColor])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem("qr-codes", JSON.stringify(qrCodes)) }
    catch { toast({ title: t("error"), description: t("storageFull"), variant: "destructive" }) }
  }, [hydrated, qrCodes])

  const generateQRContent = () => encodeQRContent(formData)

  const generateQRCode = async () => {
    if (!formData.content.trim() || !formData.title.trim()) {
      toast({
        title: t("error"),
        description: t("fillRequired"),
        variant: "destructive",
      })
      return
    }

    if (isGenerating) return
    setIsGenerating(true)
    try {
      const qrContent = generateQRContent()
      const size = Number.parseInt(formData.qrSize)
      if (!/^#[0-9a-f]{6}$/i.test(formData.foregroundColor) || !/^#[0-9a-f]{6}$/i.test(formData.backgroundColor) || formData.foregroundColor.toLowerCase() === formData.backgroundColor.toLowerCase()) throw new Error(t("invalidColors"))


      // Create canvas
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("generateQRCode: Failed to get 2D rendering context for canvas.")
        toast({
          title: t("error"),
          description: t("errorDesc"),
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      // Use QRCode.toCanvas to draw the base QR code
      await new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(
          canvas,
          qrContent,
          {
            errorCorrectionLevel: formData.qrLogo ? "H" : "M",
            width: size,
            color: {
              dark: formData.foregroundColor,
              light: formData.backgroundColor,
            },
          },
          (err) => {
            if (err) {
              console.error("generateQRCode: QRCode.toCanvas error:", err)
              reject(err)
            } else {
              resolve()
            }
          },
        )
      })

      // Helper function to add the QR code to the list and update preview
      const addFinalQrCode = (finalQrDataUrl: string) => {
        setCurrentQRPreview(finalQrDataUrl)

        const expiresAt =
          formData.expirationDays === "never"
            ? null
            : new Date(Date.now() + Number.parseInt(formData.expirationDays) * 24 * 60 * 60 * 1000)

        const newQRCode: QRCodeData = {
          id: crypto.randomUUID(),
          encodedContent: qrContent,
          exportOptions: { size, foreground: formData.foregroundColor, background: formData.backgroundColor, logo: formData.qrLogo },
          type: formData.type,
          content: formData.content,
          title: formData.title,
          createdAt: new Date(),
          expiresAt,
          qrCodeDataUrl: finalQrDataUrl, // Use the final data URL
          qrStyle: formData.qrLogo ? "classic-with-logo" : "classic", // Simplified style string
          additionalData: {
            password: formData.password,
            subject: formData.subject,
            message: formData.message,
          },
        }

        setQrCodes((prev) => [newQRCode, ...prev])
        setCurrentQRCode(newQRCode)

        toast({
          title: t("success"),
          description: t("successDesc"),
        })
      }

      // Add logo if provided
      if (formData.qrLogo) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
          const logoSize = canvas.width * 0.2
          const x = (canvas.width - logoSize) / 2
          const y = (canvas.height - logoSize) / 2

          // Draw white background for logo to ensure visibility
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize * 0.6, 0, 2 * Math.PI) // Slightly larger circle than logo
          ctx.fill()

          // Draw logo
          ctx.drawImage(img, x, y, logoSize, logoSize)
          addFinalQrCode(canvas.toDataURL())
          resolve()
          } catch (error) { reject(error) }
        }
        img.onerror = () => reject(new Error(t("logoError")))
        img.src = formData.qrLogo
        })
      } else {
        addFinalQrCode(canvas.toDataURL()) // Add to list immediately if no logo
      }
    } catch (error: any) {
      // Validation failures are shown in the selected language.
      toast({
        title: t("error"),
        description: error instanceof QRContentError ? t(error.key) : [t("invalidColors"), t("logoError")].includes(error.message) ? error.message : t("errorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogoUpload = (file: File) => {
    if (file && ["image/png", "image/jpeg", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024) {
      // 5MB limit
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string
        setFormData((prev) => ({ ...prev, qrLogo: logoDataUrl }))
      }
      reader.onerror = (e) => {
        console.error("handleLogoUpload: FileReader error:", e)
        toast({
          title: t("error"),
          description: t("logoError"),
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: t("error"),
        description: t("logoFileError"),
        variant: "destructive",
      })
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, qrLogo: "" }))
  }

  const downloadQRCode = async (qrCode: QRCodeData, format: "png" | "svg" = "png") => {
    let objectUrl: string | undefined
    try {
      let href = qrCode.qrCodeDataUrl
      if (format === "svg") {
        const payload = qrCode.encodedContent || encodeQRContent({ type: qrCode.type, content: qrCode.content, ...qrCode.additionalData })
        const options = qrCode.exportOptions || { size: 256, foreground: "#000000", background: "#ffffff", logo: "" }
        let svg: string
        if (!qrCode.exportOptions && qrCode.qrStyle === "classic-with-logo") {
          // Legacy records did not retain their logo; preserve their exact visual.
          svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><image href="${qrCode.qrCodeDataUrl}" width="256" height="256"/></svg>`
        } else {
          svg = await QRCode.toString(payload, { type: "svg", width: options.size, errorCorrectionLevel: options.logo ? "H" : "M", color: { dark: options.foreground, light: options.background } })
          if (options.logo) {
            // Use a nested viewport: qrcode's SVG viewBox is measured in modules.
            const modules = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1])
            const size = modules * 0.2
            svg = svg.replace("</svg>", `<circle cx="${modules / 2}" cy="${modules / 2}" r="${size * 0.6}" fill="white"/><image href="${options.logo}" x="${(modules - size) / 2}" y="${(modules - size) / 2}" width="${size}" height="${size}" preserveAspectRatio="none"/></svg>`)
          }
        }
        objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
        href = objectUrl
      }
      const link = document.createElement("a")
      link.download = `${qrCode.title.replace(/[<>:"/\\|?*]/g, "-") || "qr-code"}.${format}`
      link.href = href
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast({ title: t("error"), description: t("downloadError"), variant: "destructive" })
    } finally {
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl!), 1000)
    }
  }

  const downloadCurrentQR = (format: "png" | "svg") => {
    if (currentQRCode) void downloadQRCode(currentQRCode, format)
  }

  const deleteQRCode = (id: string) => {
    setQrCodes((prev) => prev.filter((qr) => qr.id !== id))
    toast({
      title: t("deleted"),
      description: t("deletedDesc"),
    })
  }

  const copyToClipboard = async (qrCode: QRCodeData) => {
    try {
      await navigator.clipboard.writeText(qrCode.encodedContent || encodeQRContent({ type: qrCode.type, content: qrCode.content, ...qrCode.additionalData }))
      toast({ title: t("copied"), description: t("copiedDesc") })
    } catch { toast({ title: t("error"), description: t("copyError"), variant: "destructive" }) }
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
      <Header language={language} setLanguage={changeLanguage} />

      <main lang={localeTags[language]} id="main-content" className="pt-24 px-3 pb-6 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t("title")}</h1>
            <p className="text-base sm:text-lg text-gray-600 px-4">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Creation form */}
            <div className="xl:col-span-2 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    {t("createQR")}
                  </CardTitle>
                  <CardDescription>{t("fillForm")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">{t("name")} *</Label>
                      <Input
                        id="title"
                        placeholder={t("namePlaceholder")}
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">{t("contentType")}</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger id="type">
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
                    <Label htmlFor="content">{t("content")} *</Label>
                    {formData.type === "text" ? (
                      <Textarea
                        id="content"
                        placeholder={getPlaceholder(formData.type)}
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        rows={3}
                      />
                    ) : (
                      <Input
                        inputMode={formData.type === "email" ? "email" : ["phone", "sms"].includes(formData.type) ? "tel" : formData.type === "website" ? "url" : "text"}
                        autoCapitalize="off"
                        spellCheck={false}
                        id="content"
                        placeholder={getPlaceholder(formData.type)}
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                      />
                    )}
                  </div>

                  {renderAdditionalFields()}

                  {/* QR Style Selector Component - now only for logo */}
                  <QRStyleSelector
                    language={language}
                    qrLogo={formData.qrLogo}
                    onLogoUpload={handleLogoUpload}
                    onRemoveLogo={removeLogo}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="qrSize">{t("qrSize")}</Label>
                      <Select
                        value={formData.qrSize}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, qrSize: value }))}
                      >
                        <SelectTrigger id="qrSize">
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
                      <Label htmlFor="foregroundColor">{t("foregroundColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="foregroundColor"
                          type="color"
                          value={formData.foregroundColor}
                          aria-label={t("foregroundColor")}
                          onChange={(e) => setFormData((prev) => ({ ...prev, foregroundColor: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.foregroundColor}
                          aria-label={t("foregroundColor")}
                          onChange={(e) => setFormData((prev) => ({ ...prev, foregroundColor: e.target.value }))}
                          className="flex-1 min-w-0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="backgroundColor">{t("backgroundColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          aria-label={t("backgroundColor")}
                          onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.backgroundColor}
                          aria-label={t("backgroundColor")}
                          onChange={(e) => setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                          className="flex-1 min-w-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiration">{t("expiration")}</Label>
                    <Select
                      value={formData.expirationDays}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, expirationDays: value }))}
                    >
                      <SelectTrigger id="expiration">
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
                    <p className="text-xs text-gray-500 mt-2">{t("expirationNote")}</p>
                  </div>

                  <Button
                    onClick={generateQRCode}
                    disabled={isGenerating || !hydrated}
                    aria-busy={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  >
                    {isGenerating ? t("generating") : t("create")}
                  </Button>
                </CardContent>
              </Card>

              {/* QR Preview */}
              <QRPreview
                qrDataUrl={currentQRPreview}
                title={currentQRCode?.title || ""}
                language={language}
                onDownloadPNG={() => downloadCurrentQR("png")}
                onDownloadSVG={() => downloadCurrentQR("svg")}
              />
            </div>

            {/* List of created QR codes */}
            <div className="space-y-4 min-w-0">
              <h2 className="text-2xl font-semibold">
                {t("createdQRs")} ({qrCodes.length})
              </h2>

              {qrCodes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{t("noQRCodes")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 xl:max-h-[800px] xl:overflow-y-auto">
                  {qrCodes.map((qrCode) => {
                    const Icon = getTypeIcon(qrCode.type)
                    return (
                      <Card key={qrCode.id} className={isExpired(qrCode) ? "opacity-50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex flex-col items-start gap-4">
                            <div className="flex items-start gap-4 w-full">
                              <div className="flex-shrink-0">
                                <img
                                  src={qrCode.qrCodeDataUrl || "/placeholder.svg"}
                                  alt={qrCode.title}
                                  className="w-16 h-16 border rounded"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold truncate">{qrCode.title}</h3>
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Icon className="w-3 h-3" />
                                    {t(qrCode.type as TranslationKey)}
                                  </Badge>
                                  <Badge variant="outline">{qrCode.qrStyle === "classic-with-logo" ? t("withLogo") : t("classic")}</Badge>
                                  {isExpired(qrCode) && <Badge variant="destructive">{t("expired")}</Badge>}
                                </div>

                                <p className="text-sm text-gray-600 truncate mb-2">{qrCode.content}</p>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {qrCode.createdAt.toLocaleDateString(localeTags[language])}
                                  </span>
                                  {qrCode.expiresAt && (
                                    <span>
                                      {t("expires")}:{" "}
                                      {qrCode.expiresAt.toLocaleDateString(localeTags[language])}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(qrCode, "png")}
                                className="flex-1 min-w-[100px]"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PNG
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadQRCode(qrCode, "svg")}
                                className="flex-1 min-w-[100px]"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                SVG
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(qrCode)}
                                className="flex-1 min-w-[100px]"
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                {t("copy")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteQRCode(qrCode.id)}
                                className="flex-1 min-w-[100px] text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
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

          {/* Privacy information */}
          <Card className="mt-8 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap sm:flex-nowrap items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-green-800 mb-1">{t("privacy")}</h4>
                  <p className="text-sm text-green-700">{t("privacyDesc")}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivacyModal(true)}
                  className="w-full sm:w-auto flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Shield className="w-4 h-4" />
                  {t("learnMore")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
          <div className="max-w-7xl mx-auto"><GeneratorGuide language={language} /></div>
      </main>

      <Footer language={language} />

      <PrivacyModal language={language} isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  )
}
