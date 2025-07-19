export interface QRStyleOptions {
  pattern: "square" | "circle" | "rounded" | "dots"
  cornerStyle: "square" | "circle" | "rounded"
  logo?: string
}

export const drawQRWithStyle = (
  canvas: HTMLCanvasElement,
  qrData: boolean[][],
  options: QRStyleOptions,
  colors: { foreground: string; background: string },
) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const size = canvas.width
  const moduleCount = qrData.length
  const moduleSize = size / moduleCount

  // Clear canvas
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = colors.foreground

  // Draw QR modules with pattern
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qrData[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize

        // Skip corner detection patterns - we'll draw them separately
        if (isCornerPattern(row, col, moduleCount)) {
          continue
        }

        drawModule(ctx, x, y, moduleSize, options.pattern)
      }
    }
  }

  // Draw corner patterns
  drawCornerPatterns(ctx, moduleSize, moduleCount, options, colors.foreground)

  // Add logo if provided
  if (options.logo) {
    drawLogo(ctx, options.logo, size)
  }
}

const drawModule = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: QRStyleOptions["pattern"],
) => {
  const centerX = x + size / 2
  const centerY = y + size / 2

  switch (pattern) {
    case "circle":
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.4, 0, 2 * Math.PI)
      ctx.fill()
      break

    case "rounded":
      const cornerRadius = size * 0.2
      ctx.beginPath()
      ctx.roundRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, cornerRadius)
      ctx.fill()
      break

    case "dots":
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.3, 0, 2 * Math.PI)
      ctx.fill()
      break

    case "square":
    default:
      ctx.fillRect(x, y, size, size)
      break
  }
}

const isCornerPattern = (row: number, col: number, moduleCount: number): boolean => {
  // Top-left corner
  if (row < 9 && col < 9) return true
  // Top-right corner
  if (row < 9 && col >= moduleCount - 8) return true
  // Bottom-left corner
  if (row >= moduleCount - 8 && col < 9) return true
  return false
}

const drawCornerPatterns = (
  ctx: CanvasRenderingContext2D,
  moduleSize: number,
  moduleCount: number,
  options: QRStyleOptions,
  color: string,
) => {
  ctx.fillStyle = color

  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: (moduleCount - 7) * moduleSize, y: 0 }, // Top-right
    { x: 0, y: (moduleCount - 7) * moduleSize }, // Bottom-left
  ]

  corners.forEach((corner) => {
    drawCornerPattern(ctx, corner.x, corner.y, moduleSize * 7, options)
  })
}

const drawCornerPattern = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: QRStyleOptions,
) => {
  const { cornerStyle } = options

  // Outer ring
  drawCornerRing(ctx, x, y, size, cornerStyle)

  // Inner dot
  const dotSize = size * 0.43
  const dotX = x + (size - dotSize) / 2
  const dotY = y + (size - dotSize) / 2
  drawCornerDot(ctx, dotX, dotY, dotSize, cornerStyle)
}

const drawCornerRing = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: QRStyleOptions["cornerStyle"],
) => {
  const thickness = size * 0.14

  switch (style) {
    case "circle":
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
      ctx.arc(x + size / 2, y + size / 2, size / 2 - thickness, 0, 2 * Math.PI, true)
      ctx.fill()
      break

    case "rounded":
      const outerRadius = size * 0.1
      const innerRadius = outerRadius * 0.5
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, outerRadius)
      ctx.roundRect(x + thickness, y + thickness, size - thickness * 2, size - thickness * 2, innerRadius, true)
      ctx.fill()
      break

    case "square":
    default:
      ctx.fillRect(x, y, size, thickness) // Top
      ctx.fillRect(x, y, thickness, size) // Left
      ctx.fillRect(x + size - thickness, y, thickness, size) // Right
      ctx.fillRect(x, y + size - thickness, size, thickness) // Bottom
      break
  }
}

const drawCornerDot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: QRStyleOptions["cornerStyle"],
) => {
  const centerX = x + size / 2
  const centerY = y + size / 2

  switch (style) {
    case "circle":
      ctx.beginPath()
      ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI)
      ctx.fill()
      break

    case "rounded":
      const radius = size * 0.15
      ctx.beginPath()
      ctx.roundRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, radius)
      ctx.fill()
      break

    case "square":
    default:
      ctx.fillRect(x, y, size, size)
      break
  }
}

const drawLogo = (ctx: CanvasRenderingContext2D, logoDataUrl: string, canvasSize: number) => {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    const logoSize = canvasSize * 0.2
    const x = (canvasSize - logoSize) / 2
    const y = (canvasSize - logoSize) / 2

    // Draw white background circle for logo
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(canvasSize / 2, canvasSize / 2, logoSize * 0.6, 0, 2 * Math.PI)
    ctx.fill()

    // Draw logo
    ctx.drawImage(img, x, y, logoSize, logoSize)
  }
  img.src = logoDataUrl
}

export const drawLogoOnQR = (canvas: HTMLCanvasElement, logoDataUrl: string) => {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    const canvasSize = canvas.width
    const logoSize = canvasSize * 0.2
    const x = (canvasSize - logoSize) / 2
    const y = (canvasSize - logoSize) / 2

    // Draw white background circle for logo
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(canvasSize / 2, canvasSize / 2, logoSize * 0.6, 0, 2 * Math.PI)
    ctx.fill()

    // Draw logo
    ctx.drawImage(img, x, y, logoSize, logoSize)
  }
  img.src = logoDataUrl
}
