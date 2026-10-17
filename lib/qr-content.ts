export interface QRContentInput {
  type: string
  content: string
  password?: string
  subject?: string
  message?: string
}

const escapeWifi = (value: string) => value.replace(/([\\;,:"\x00])/g, "\\$1")

type ContentErrorKey = "invalidContent" | "invalidWebsite" | "invalidEmail" | "invalidPhone" | "invalidLocation"
export class QRContentError extends Error {
  constructor(public key: ContentErrorKey) { super(key); this.name = "QRContentError" }
}

/** Encode the same payload for PNG, SVG, history and clipboard. */
export function encodeQRContent(input: QRContentInput): string {
  const content = input.content.trim()
  if (!content) throw new QRContentError("invalidContent")
  switch (input.type) {
    case "website": {
      let url: URL
      try { url = new URL(/^https?:\/\//i.test(content) ? content : `https://${content}`) }
      catch { throw new QRContentError("invalidWebsite") }
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".")) {
        throw new QRContentError("invalidWebsite")
      }
      return url.href
    }
    case "email": {
      if (!/^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(content)) throw new QRContentError("invalidEmail")
      const params = new URLSearchParams()
      if (input.subject) params.set("subject", input.subject)
      if (input.message) params.set("body", input.message)
      return `mailto:${content}${params.size ? `?${params.toString().replace(/\+/g, "%20")}` : ""}`
    }
    case "phone":
    case "sms": {
      const phone = content.replace(/[\s().-]/g, "")
      if (!/^\+?\d{3,15}$/.test(phone)) throw new QRContentError("invalidPhone")
      return input.type === "phone" ? `tel:${phone}` : `sms:${phone}${input.message ? `?body=${encodeURIComponent(input.message)}` : ""}`
    }
    case "wifi":
      return `WIFI:T:${input.password ? "WPA" : "nopass"};S:${escapeWifi(input.content)};P:${escapeWifi(input.password || "")};H:false;;`
    case "location": {
      const parts = content.split(",")
      const [lat, lng] = parts.map(Number)
      if (parts.length !== 2 || parts.some((part) => !part.trim()) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new QRContentError("invalidLocation")
      }
      return `geo:${lat},${lng}`
    }
    default:
      return input.content
  }
}
