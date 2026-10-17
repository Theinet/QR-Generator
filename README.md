# THE INET QR Code Generator

A free QR code generator for websites, Wi-Fi, text, email, phone numbers, SMS and locations. Content and logos are processed in the browser.

**Live app:** [qr.theinet.ch](https://qr.theinet.ch)

## Languages

[Deutsch (Schweiz)](https://qr.theinet.ch/de) · [Français](https://qr.theinet.ch/fr) · [Italiano](https://qr.theinet.ch/it) · [English](https://qr.theinet.ch/en) · [Українська](https://qr.theinet.ch/uk)

The entry page respects a saved language choice, then the browser's supported languages, with German as the fallback. Explicit language URLs always take precedence. Project source code, comments and primary technical documentation remain in English.

## Features

- PNG and SVG downloads using the same encoded content.
- Custom colors, image sizes and optional PNG/JPEG/WebP logos.
- Responsive forms, previews and keyboard-accessible language and privacy controls.
- Local QR history, clipboard copy and deletion.
- Local history reminders; downloaded static QR codes do not expire.
- Translated metadata, canonical URLs, hreflang and sitemap for all five languages.

## Privacy

QR content and uploaded logos are processed locally. History is stored in this browser **without encryption** and may be visible to other people using the same browser profile. Delete entries or clear browser data to remove history. Download a copy before clearing it.

The browser contacts our hosting provider to load the website. External links open their respective services. No account is required to generate QR codes.

## Development

```sh
pnpm install
pnpm dev
```

```sh
pnpm typecheck
pnpm build
pnpm start
```

Stack: Next.js 14, React, TypeScript, Tailwind CSS, Radix UI and `qrcode`.

## Contact

[THE INET](https://www.theinet.ch) · [contact@theinet.ch](mailto:contact@theinet.ch)

## License

See [LICENSE](LICENSE) for the repository's MIT license.
