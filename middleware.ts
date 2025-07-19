import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const trustedHost = "qr-generator-theinet.vercel.app"
  const currentHost = request.headers.get("host") || ""

  const isLocalhost =
    currentHost.startsWith("localhost") || currentHost.startsWith("127.0.0.1")

  const isOfficial = currentHost === trustedHost

  if (isLocalhost || isOfficial) {
    return NextResponse.next()
  }

  return new Response(
    `
    🚫 You are using an unofficial copy of the QR generator.

    This domain is not authorized.
    Official version: https://${trustedHost}

    Unauthorized copying or phishing may result in blocking or legal consequences.
    `,
    {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  )
}
