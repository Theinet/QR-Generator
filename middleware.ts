import { NextRequest, NextResponse } from "next/server"
import { isLanguage, preferredLanguage } from "./lib/languages"

export function middleware(request: NextRequest) {
  const first = request.nextUrl.pathname.split("/")[1]
  if (isLanguage(first)) {
    const headers = new Headers(request.headers)
    headers.set("x-qr-locale", first)
    return NextResponse.next({ request: { headers } })
  }
  if (request.nextUrl.pathname !== "/") return NextResponse.next()
  const bot = /bot|crawler|spider|slurp/i.test(request.headers.get("user-agent") || "")
  const language = bot ? "de" : preferredLanguage(request.headers.get("accept-language") || "", request.cookies.get("NEXT_LOCALE")?.value)
  const destination = request.nextUrl.clone()
  destination.pathname = `/${language}`
  const response = NextResponse.redirect(destination)
  response.headers.set("Vary", "Accept-Language, Cookie")
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = { matcher: ["/", "/de", "/fr", "/it", "/en", "/uk"] }
