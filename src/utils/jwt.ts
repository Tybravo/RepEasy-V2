export type DecodedJwt = {
  header: Record<string, any>
  payload: Record<string, any>
}

export function isJwt(token: string) {
  return typeof token === 'string' && token.split('.').length === 3
}

export function decodeJwt(token: string): DecodedJwt | null {
  if (!isJwt(token)) return null
  try {
    const [h, p] = token.split('.').slice(0, 2)
    const header = JSON.parse(atob(normalizeB64(h)))
    const payload = JSON.parse(atob(normalizeB64(p)))
    return { header, payload }
  } catch {
    return null
  }
}

function normalizeB64(input: string) {
  return input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
}
