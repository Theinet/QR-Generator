export const languageCodes = ["de", "fr", "it", "en", "uk"] as const
export type LanguageCode = typeof languageCodes[number]
export const languageNames: Record<LanguageCode, string> = { de: "Deutsch", fr: "Français", it: "Italiano", en: "English", uk: "Українська" }
export const localeTags: Record<LanguageCode, string> = { de: "de-CH", fr: "fr-CH", it: "it-CH", en: "en", uk: "uk-UA" }
export const isLanguage = (value: unknown): value is LanguageCode => typeof value === "string" && languageCodes.includes(value as LanguageCode)

/** Match browser preferences in quality order; an unsupported language falls back to German. */
export function preferredLanguage(acceptLanguage: string, saved?: string): LanguageCode {
  if (isLanguage(saved)) return saved
  const preferences = acceptLanguage.split(",").map((entry, index) => {
    const [tag, ...parameters] = entry.trim().toLowerCase().split(";")
    const quality = parameters.find((p) => p.trim().startsWith("q="))
    return { code: tag.split("-")[0], quality: quality ? Number(quality.trim().slice(2)) : 1, index }
  }).filter((item) => Number.isFinite(item.quality) && item.quality > 0).sort((a, b) => b.quality - a.quality || a.index - b.index)
  return preferences.find((item) => isLanguage(item.code))?.code as LanguageCode || "de"
}
