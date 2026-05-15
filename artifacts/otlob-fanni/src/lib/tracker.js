const SESSION_KEY = 'of_sid'
const API = (import.meta.env.VITE_API_URL || '/api') + '/analytics'

function getSession() {
  let s = sessionStorage.getItem(SESSION_KEY)
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(SESSION_KEY, s)
  }
  return s
}

function getDevice() {
  const w = window.innerWidth
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

export function track(event, ref = null) {
  try {
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        path: location.pathname,
        ref: ref ? String(ref) : null,
        sessionId: getSession(),
        device: getDevice(),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch (_) {}
}
