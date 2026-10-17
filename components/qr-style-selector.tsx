"use client"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ChevronDown } from "lucide-react"
import { getTranslation } from "@/lib/i18n"
import type { Language } from "@/lib/i18n"

export default function QRStyleSelector({ language, qrLogo, onLogoUpload, onRemoveLogo }: { language: Language; qrLogo: string; onLogoUpload: (file: File) => void; onRemoveLogo: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [fileName, setFileName] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key)
  return <div className="rounded-lg border border-gray-200">
    <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="logo-options" className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50">
      <span>{t("addLogo")}{qrLogo ? " ✓" : ""}</span><ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>
    {expanded && <div id="logo-options" className="p-4 pt-1">
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={t("logoImage")} onChange={(e) => { const file = e.target.files?.[0]; if (file) { setFileName(file.name); onLogoUpload(file) }; e.target.value = "" }} />
      {!qrLogo ? <div className="rounded-lg border-2 border-dashed p-4 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { setFileName(file.name); onLogoUpload(file) } }}>
        <p className="text-sm text-gray-600 mb-3">PNG, JPEG, WebP · {t("logoLimit")}</p>
        <Button type="button" variant="outline" onClick={() => input.current?.click()}><Upload className="w-4 h-4 mr-2" />{t("chooseImage")}</Button>
      </div> : <div className="flex gap-3 items-center min-w-0">
        <img src={qrLogo} alt={t("uploadedLogo")} className="w-14 h-14 shrink-0 object-contain rounded border" />
        <p className="flex-1 min-w-0 break-all text-sm">{fileName}</p>
        <Button type="button" variant="outline" size="icon" onClick={onRemoveLogo} aria-label={t("removeLogo")}><X className="w-4 h-4" /></Button>
      </div>}
    </div>}
  </div>
}
