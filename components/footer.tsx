"use client"

import { useState, useEffect } from "react"
import { getTranslation } from "@/lib/i18n"
import type { Language } from "@/lib/i18n"

interface FooterProps {
  language: Language
}

export default function Footer({ language }: FooterProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key)
  const [year, setYear] = useState<number | null>(null)
  const [wish, setWish] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    setYear(now.getFullYear())

    // New Year wishes (January 1st)
    if (now.getMonth() === 0 && now.getDate() === 1) {
      const wishes = [t("newYear"), t("wishSuccess"), t("wishPossibilities")]
      const randomWish = wishes[Math.floor(Math.random() * wishes.length)]
      setWish(randomWish)
      const timeout = setTimeout(() => setWish(null), 10000)
      return () => clearTimeout(timeout)
    }
  }, [language])

  return (
    <footer className="bg-black text-gray-300 py-8 px-6 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/in/theinet"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 hover:scale-110 transition-all duration-300"
              title="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://x.com/theinet_dev" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)" className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 hover:scale-110 transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933zm-1.29 19.49h2.039L6.486 3.24H4.298z" /></svg>
            </a>
            <a
              href="https://github.com/Theinet"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 hover:scale-110 transition-all duration-300"
              title="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>

          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {year} THE INET - {t("rights")}
          </div>

          {/* Email */}
          <div>
            <a
              href="mailto:contact@theinet.ch"
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
            >
              contact@theinet.ch
            </a>
          </div>
        </div>
      </div>

      {wish && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm animate-pulse z-50">
          {wish}
        </div>
      )}
    </footer>
  )
}
