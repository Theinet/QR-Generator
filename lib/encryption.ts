/// lib/encryption.ts

// ---------- UTF-8-safe Base64 helpers ----------
function base64Encode(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

function base64Decode(base64: string): string {
  return decodeURIComponent(escape(atob(base64)))
}

// ---------- Simple XOR-based encryption ----------
class SimpleEncryption {
  private key: string

  constructor(key?: string) {
    this.key = key || this.generateKey()
  }

  private generateKey(): string {
    const ua = typeof window !== "undefined" ? navigator.userAgent : "server"
    const ts = Date.now().toString()
    return base64Encode(ua + ts).slice(0, 16)
  }

  private xor(data: string, key: string): string {
    let out = ""
    for (let i = 0; i < data.length; i++) {
      out += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return out
  }

  public encrypt(plain: string): string {
    return base64Encode(this.xor(plain, this.key))
  }

  public decrypt(cipher: string): string {
    try {
      return this.xor(base64Decode(cipher), this.key)
    } catch {
      return ""
    }
  }
}

// Singleton instance
export const encryption = new SimpleEncryption()

// ---------- Encrypted localStorage wrapper ----------
export const secureStorage = {
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(key, encryption.encrypt(value))
  },

  getItem(key: string): string | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(key)
    return raw ? encryption.decrypt(raw) : null
  },

  removeItem(key: string) {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  },
}
