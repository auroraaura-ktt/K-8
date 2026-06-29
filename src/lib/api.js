export async function apiRequest(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

  const url = (() => {
    if (/^https?:\/\//i.test(path)) {
      return path
    }

    const trimmedBase = baseUrl.replace(/\/+$|\s+$/g, '')
    const trimmedPath = path.replace(/^\/+/, '')

    return `${trimmedBase}/${trimmedPath}`
  })()

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}