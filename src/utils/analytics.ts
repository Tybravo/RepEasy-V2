type Properties = Record<string, any> | undefined

export function trackEvent(name: string, properties?: Properties) {
  try {
    const p = properties || {}
    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', name, p)
      return
    }
    // Segment or similar
    if (typeof window !== 'undefined' && (window as any).analytics && (window as any).analytics.track) {
      ;(window as any).analytics.track(name, p)
      return
    }
  } catch {}
  if (import.meta.env.DEV) {
    console.log('[analytics]', name, properties || {})
  }
}

export function trackError(name: string, error: unknown, properties?: Properties) {
  const payload = {
    error: normalizeError(error),
    ...(properties || {})
  }
  trackEvent(name, payload)
}

function normalizeError(err: unknown) {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack }
  }
  if (typeof err === 'string') return { message: err }
  try {
    return { message: JSON.stringify(err) }
  } catch {
    return { message: 'Unknown error' }
  }
}
