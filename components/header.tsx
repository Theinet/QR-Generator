"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, QrCode } from "lucide-react"
import type { Language } from "@/lib/i18n"

interface HeaderProps {
  language: Language
  setLanguage: (lang: Language) => void
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const toggleLang = () => setMenuOpen(!menuOpen)

  const selectLang = (newLang: Language) => {
    setLanguage(newLang)
    setMenuOpen(false)
  }

  const scrollToTop = () => {
    window.open("https://theinet.vercel.app/", "_blank")
    setMenuOpen(false)
  }

  useEffect(() => {
    let lastY = window.scrollY
    let lastHideTime = Date.now()

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY
      const now = Date.now()

      const goingDown = delta > 15
      const goingUp = delta < -25

      if (goingDown && currentY > 120 && now - lastHideTime > 400) {
        setHideHeader(true)
        lastHideTime = now
      } else if (goingUp || currentY < 100) {
        setHideHeader(false)
      }

      lastY = currentY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 py-3 bg-black text-white shadow-lg backdrop-blur-sm transition-transform duration-200 ${
        hideHeader ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={scrollToTop}
      >
        <QrCode className="w-6 h-6 text-blue-400" />
        <div>
          <div className="text-lg font-bold leading-tight">THE INET</div>
          <div className="text-xs text-gray-400 leading-tight">QR Generator</div>
        </div>
      </div>

      <div className="relative" ref={langMenuRef}>
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-700 hover:border-gray-500 hover:-translate-y-0.5 transition-all duration-300 min-w-[110px] justify-center"
        >
          <Globe className="w-3 h-3" />
          {language === "en" ? "EN" : "UA"}
          <span className="text-xs ml-1">▾</span>
        </button>

        {menuOpen && (
          <ul
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden min-w-[140px]"
            ref={menuRef}
          >
            <li>
              <button
                onClick={() => selectLang("en")}
                className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap ${
                  language === "en" ? "bg-blue-600 font-bold" : "font-medium"
                }`}
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => selectLang("uk")}
                className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-700 transition-colors duration-200 whitespace-nowrap ${
                  language === "uk" ? "bg-blue-600 font-bold" : "font-medium"
                }`}
              >
                Українська
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  )
}
