import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0b0b" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="author" content="THE INET™" />

        {/*
          Project: THE INET™ QR Generator
          Author: THE INET™ (https://qr-generator-theinet.vercel.app)
          License: MIT — Open Source
          Note: Cloning this project to impersonate or mislead users is strictly prohibited and may result in takedown requests.
        */}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
