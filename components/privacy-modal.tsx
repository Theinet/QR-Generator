"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, X, Check } from "lucide-react"
import type { Language, TranslationKey } from "@/lib/i18n"
import { getTranslation } from "@/lib/i18n"

interface PrivacyModalProps {
  language: Language
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ language, isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null

  const t = (key: TranslationKey) => getTranslation(language, key)

  const securityFeatures = [
    {
      icon: Shield,
      title: language === "uk" ? "Локальна обробка" : "Local Processing",
      description:
        language === "uk"
          ? "Всі дані обробляються тільки у вашому браузері"
          : "All data processed only in your browser",
    },
    {
      icon: Server,
      title: language === "uk" ? "Без серверів" : "No Servers",
      description: language === "uk" ? "Жодних запитів на зовнішні сервери" : "No requests to external servers",
    },
    {
      icon: Eye,
      title: language === "uk" ? "Приватність" : "Privacy",
      description: language === "uk" ? "Ніхто не може побачити ваші дані" : "Nobody can see your data",
    },
    {
      icon: Lock,
      title: language === "uk" ? "Шифрування" : "Encryption",
      description: language === "uk" ? "Дані зберігаються зашифровано локально" : "Data stored encrypted locally",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] flex flex-col">
        <Card className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-2xl rounded-lg overflow-hidden flex flex-col">
          <CardHeader className="relative pb-3 px-3 sm:px-6 pt-3 sm:pt-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-1 sm:right-2 top-1 sm:top-2 h-8 w-8 p-0 hover:bg-green-100 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 pr-10 sm:pr-8">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg lg:text-2xl text-green-800 leading-tight">
                  {language === "uk" ? "Повна Безпека" : "Complete Security"}
                </CardTitle>
                <p className="text-xs sm:text-sm text-green-600 mt-0.5 sm:mt-1">
                  {language === "uk" ? "Ваші дані залишаються тільки у вас" : "Your data stays only with you"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto px-3 sm:px-6 pb-2 min-h-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2">
                {securityFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-white/70 rounded-lg border border-green-100"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <h4 className="font-semibold text-green-800 text-xs sm:text-sm lg:text-base leading-tight">
                            {feature.title}
                          </h4>
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        </div>
                        <p className="text-xs sm:text-sm text-green-700 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white/70 rounded-lg p-2 sm:p-3 lg:p-4 border border-green-200">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-800 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">
                      {language === "uk" ? "Гарантія конфіденційності" : "Privacy Guarantee"}
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                      {language === "uk"
                        ? "Всі QR-коди генеруються локально у вашому браузері. Ваші дані ніколи не покидають ваш пристрій і не передаються на сервери THE INET або будь-які інші сервіси. Ми не збираємо, не зберігаємо і не аналізуємо ваші персональні дані."
                        : "All QR codes are generated locally in your browser. Your data never leaves your device and is not transmitted to THE INET servers or any other services. We do not collect, store or analyze your personal data."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 pt-6 border-t border-green-200/50">
            <div className="flex justify-center">
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]"
              >
                {language === "uk" ? "Зрозуміло" : "Got it"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
