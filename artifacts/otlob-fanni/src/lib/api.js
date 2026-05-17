/**
 * API client — يتصل بالـ api-server لجميع العمليات
 * Base URL: متغير VITE_API_URL أو '/api-server/api' كافتراضي
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(method, path, body) {
  const url = `${API_BASE}${path}`
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(url, opts)
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

const get  = (path)         => request('GET',    path)
const post = (path, body)   => request('POST',   path, body)
const patch = (path, body)  => request('PATCH',  path, body)
const del  = (path)         => request('DELETE', path)

export async function uploadFile(file) {
  const { uploadURL, objectPath } = await request('POST', '/storage/uploads/request-url', {
    name: file.name,
    size: file.size,
    contentType: file.type,
  })
  const putRes = await fetch(uploadURL, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`)
  return objectPath
}

export function getFileUrl(path) {
  if (!path) return null
  if (path.startsWith('data:')) return path
  if (path.startsWith('/objects/')) return `${API_BASE}/storage${path}`
  return path
}

// ── Public ───────────────────────────────────────────────────────────────────
export const api = {
  cities:     () => get('/cities'),
  categories: () => get('/categories'),
  technicians: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    )).toString()
    return get(`/technicians${qs ? '?' + qs : ''}`)
  },
  ads: (placement) => get(`/ads${placement ? '?placement=' + placement : ''}`),

  technician: (id) => get(`/technicians/${id}`),
  technicianReviews: (id) => get(`/technicians/${id}/reviews`),
  submitReview: (id, data) => post(`/technicians/${id}/reviews`, data),
  searchTechnicians: (q) => get(`/technicians/search?q=${encodeURIComponent(q)}`),
  search: (q) => get(`/search?q=${encodeURIComponent(q)}`),

  serviceRequestsByIds: (ids) => ids.length
    ? get(`/service-requests/by-ids?ids=${ids.join(',')}`)
    : Promise.resolve([]),

  updateServiceRequest: (id, status) => patch(`/service-requests/${id}/status`, { status }),

  submitTechnicianApplication: (data) => post('/technician-applications', data),
  submitCompanyApplication:    (data) => post('/company-applications',    data),
  trackRequest:                (reqNum) => get(`/status/${encodeURIComponent(reqNum)}`),
  trackRequestByPhone:         (phone)  => get(`/status-by-phone/${encodeURIComponent(phone.replace(/\D/g,''))}`),

  companies: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    )).toString()
    return get(`/companies${qs ? '?' + qs : ''}`)
  },
  company: (id) => get(`/companies/${id}`),
  companyReviews: (id) => get(`/companies/${id}/reviews`),
  submitCompanyReview: (id, data) => post(`/companies/${id}/reviews`, data),
  recentlyJoined: () => get('/recently-joined'),
  submitAdRequest:             (data) => post('/ad-requests',             data),
  referralStats:               (id)   => get(`/referral-stats/${id}`),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    login:         (email, password) => post('/admin/login', { email, password }),
    searchAccount: (q)              => get(`/admin/search-account?q=${encodeURIComponent(q)}`),

    stats: () => get('/admin/stats'),

    technicianApplications: {
      list:    ()                      => get('/admin/technician-applications'),
      update:  (id, status, opts = {}) => patch(`/admin/technician-applications/${id}`, { status, ...opts }),
      publish: (id)                    => patch(`/admin/technician-applications/${id}`, { status: 'published' }),
      delete:  (id)                    => del(`/admin/technician-applications/${id}`),
    },

    companyApplications: {
      list:    ()                      => get('/admin/company-applications'),
      update:  (id, status, opts = {}) => patch(`/admin/company-applications/${id}`, { status, ...opts }),
      publish: (id)                    => patch(`/admin/company-applications/${id}`, { status: 'published' }),
      delete:  (id)                    => del(`/admin/company-applications/${id}`),
    },

    technicians: {
      list:   ()         => get('/admin/technicians'),
      create: (data)     => post('/admin/technicians', data),
      update: (id, data) => patch(`/admin/technicians/${id}`, data),
      delete: (id)       => del(`/admin/technicians/${id}`),
    },

    cities: {
      list:   ()         => get('/admin/cities'),
      create: (data)     => post('/admin/cities', data),
      update: (id, data) => patch(`/admin/cities/${id}`, data),
      delete: (id)       => del(`/admin/cities/${id}`),
    },

    categories: {
      list:   ()         => get('/admin/categories'),
      create: (data)     => post('/admin/categories', data),
      update: (id, data) => patch(`/admin/categories/${id}`, data),
      delete: (id)       => del(`/admin/categories/${id}`),
    },

    ads: {
      list:   ()         => get('/admin/ads'),
      create: (data)     => post('/admin/ads', data),
      update: (id, data) => patch(`/admin/ads/${id}`, data),
      delete: (id)       => del(`/admin/ads/${id}`),
    },

    adRequests: {
      list:   ()             => get('/admin/ad-requests'),
      update: (id, status)  => patch(`/admin/ad-requests/${id}`, { status }),
      delete: (id)          => del(`/admin/ad-requests/${id}`),
    },

    serviceRequests: {
      list:   ()             => get('/admin/service-requests'),
      update: (id, status)  => patch(`/admin/service-requests/${id}`, { status }),
      delete: (id)          => del(`/admin/service-requests/${id}`),
    },

    adminUsers: {
      list:   ()         => get('/admin/admin-users'),
      create: (data)     => post('/admin/admin-users', data),
      update: (id, data) => patch(`/admin/admin-users/${id}`, data),
      delete: (id)       => del(`/admin/admin-users/${id}`),
    },

    storageUsage: () => get('/admin/storage-usage'),
    analytics: () => get('/admin/analytics'),

    companies: {
      list:         ()             => get('/admin/companies'),
      setStatus:    (id, status)  => patch(`/admin/companies/${id}/status`, { status }),
      update:       (id, data)    => patch(`/admin/companies/${id}`, data),
    },

  },
}

export default api
