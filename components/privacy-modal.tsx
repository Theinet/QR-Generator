"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { swissPrivacy } from "@/lib/swiss-content"
import { getTranslation } from "@/lib/i18n"
import type { Language } from "@/lib/i18n"

export default function PrivacyModal({ language, isOpen, onClose }: { language: Language; isOpen: boolean; onClose: () => void }) {
  const english = language === "en"
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key)
  const facts = language === "de" || language === "fr" || language === "it" ? swissPrivacy[language] : english ? [
    ["Generated on your device", "QR content and uploaded logos are processed in your browser, without sending them to our server."],
    ["Local history", "Created QR codes are saved in this browser’s local storage. They are not encrypted and may be accessible to other people using this browser profile."],
    ["Your choice", "Download your QR codes to keep a copy. Use Delete to remove an item from browser history. Clearing browser data also removes your saved history."],
    ["Website connection", "Your browser connects to our hosting provider to load the website. QR generation itself runs locally. External links open the services they point to."],
  ] : [
    ["Створення на вашому пристрої", "Вміст QR-кодів та завантажені логотипи обробляються у браузері без надсилання на наш сервер."],
    ["Локальна історія", "Створені QR-коди зберігаються в локальній пам’яті цього браузера без шифрування. Інші користувачі цього профілю браузера можуть мати до них доступ."],
    ["Ваш вибір", "Завантажуйте QR-коди, щоб мати копію. Кнопка видалення прибирає код з історії. Очищення даних браузера також видаляє історію."],
    ["З’єднання із сайтом", "Для завантаження сайту браузер підключається до хостингу. Генерація QR-кодів працює локально. Зовнішні посилання відкривають відповідні сервіси."],
  ]
  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent closeLabel={t("close")} className="w-[calc(100%-1.5rem)] max-w-2xl max-h-[85dvh] overflow-y-auto rounded-xl p-5 sm:p-6 bg-green-50 border-green-200">
      <DialogTitle className="text-xl sm:text-2xl text-green-900 pr-8">{t("privacyTitle")}</DialogTitle>
      <DialogDescription>{t("privacyIntro")}</DialogDescription>
      <div className="grid gap-3 sm:grid-cols-2">{facts.map(([title, description]) => <section key={title} className="rounded-lg border border-green-200 bg-white p-4"><h3 className="font-semibold text-green-900">{title}</h3><p className="text-sm leading-relaxed text-green-800 mt-2">{description}</p></section>)}</div>
      <Button onClick={onClose} className="bg-green-700 hover:bg-green-800 text-white">{t("gotIt")}</Button>
    </DialogContent>
  </Dialog>
}
