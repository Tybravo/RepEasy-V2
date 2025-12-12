export type EphemeralItem<T> = { value: T; expiresAt: number }

const PREFIX = 'repeasy:'

export function setEphemeral<T>(key: string, value: T, ttlMs: number) {
  const expiresAt = Date.now() + ttlMs
  const payload: EphemeralItem<T> = { value, expiresAt }
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(payload))
  } catch {}
}

export function getEphemeral<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EphemeralItem<T>
    if (!parsed || typeof parsed.expiresAt !== 'number') {
      sessionStorage.removeItem(PREFIX + key)
      return null
    }
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(PREFIX + key)
      return null
    }
    return parsed.value
  } catch {
    return null
  }
}

export function removeEphemeral(key: string) {
  try {
    sessionStorage.removeItem(PREFIX + key)
  } catch {}
}
