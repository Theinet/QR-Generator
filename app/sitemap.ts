import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { languageCodes, localeTags } from "@/lib/languages"
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(languageCodes.map((code) => [code === "de" || code === "fr" || code === "it" ? localeTags[code] : code, `${SITE_URL}/${code}`]))
  return languageCodes.map((code) => ({ url: `${SITE_URL}/${code}`, changeFrequency: "monthly", alternates: { languages } }))
}
