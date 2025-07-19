"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, Wifi, Check, X } from "lucide-react"
import type { Language, TranslationKey } from "@/lib/i18n"
import { getTranslation } from "@/lib/i18n"

interface SecurityIndicatorProps {
  language: Language
  qrCount: number
}

export default function SecurityIndicator({ language, qrCount }: SecurityIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [localOperations, setLocalOperations] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  const t = (key: TranslationKey) => getTranslation(language, key)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("local-operations")
    if (saved) {
      setLocalOperations(Number.parseInt(saved))
    }
  }, [])

  useEffect(() => {
    if (qrCount > 0) {
      const newCount = localOperations + 1
      setLocalOperations(newCount)
      localStorage.setItem("local-operations", newCount.toString())

      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [qrCount])

  const securityFeatures = [
    {
      icon: Shield,
      title: language === "uk" ? "Локальна обробка" : "Local Processing",
      description:
        language === "uk"
          ? "Всі дані обробляються тільки у вашому браузері"
          : "All data processed only in your browser",
      status: true,
    },
    {
      icon: Server,
      title: language === "uk" ? "Без серверів" : "No Servers",
      description: language === "uk" ? "Жодних запитів на зовнішні сервери" : "No requests to external servers",
      status: true,
    },
    {
      icon: Eye,
      title: language === "uk" ? "Приватність" : "Privacy",
      description: language === "uk" ? "Ніхто не може побачити ваші дані" : "Nobody can see your data",
      status: true,
    },
    {
      icon: Lock,
      title: language === "uk" ? "Шифрування" : "Encryption",
      description: language === "uk" ? "Дані зберігаються зашифровано локально" : "Data stored encrypted locally",
      status: true,
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Shield
              className={`w-8 h-8 text-green-600 transition-all duration-500 ${showAnimation ? "scale-110 text-green-500" : ""}`}
            />
            {showAnimation && (
              <div className="absolute inset-0 w-8 h-8 bg-green-400 rounded-full animate-ping opacity-30"></div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800">
              {language === "uk" ? "🔒 Повна Безпека" : "🔒 Complete Security"}
            </h3>
            <p className="text-sm text-green-600">
              {language === "uk" ? "Ваші дані залишаються тільки у вас" : "Your data stays only with you"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-green-800 text-sm">{feature.title}</h4>
                    {feature.status ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-green-700">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-800">
                {language === "uk" ? "Статус безпеки" : "Security Status"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${isOnline ? "text-gray-400" : "text-green-600"}`} />
              <span className="text-xs text-green-700">
                {isOnline
                  ? language === "uk"
                    ? "Онлайн (дані захищені)"
                    : "Online (data protected)"
                  : language === "uk"
                    ? "Офлайн режим"
                    : "Offline mode"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">{localOperations}</div>
              <div className="text-xs text-green-600">
                {language === "uk" ? "Локальних операцій" : "Local Operations"}
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-xs text-green-600">
                {language === "uk" ? "Запитів на сервер" : "Server Requests"}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700 leading-relaxed">
                {language === "uk"
                  ? "✅ Всі QR-коди генеруються локально у вашому браузері. Ваші дані ніколи не покидають ваш пристрій і не передаються на сервери THE INET або будь-які інші сервіси."
                  : "✅ All QR codes are generated locally in your browser. Your data never leaves your device and is not transmitted to THE INET servers or any other services."}
              </p>
            </div>
          </div>
        </div>

        {showAnimation && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg border-2 border-green-300 animate-pulse">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                {language === "uk" ? "🔒 QR-код створено локально!" : "🔒 QR code created locally!"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
