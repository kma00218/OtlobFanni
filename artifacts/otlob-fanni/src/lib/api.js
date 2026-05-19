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

/**
 * Compress an image file using Canvas API before upload.
 * - Resizes to max 1200px on longest side
 * - Converts to JPEG at 82% quality
 * - Skips non-image files (PDF, etc.)
 * Typical reduction: 5 MB photo → ~200 KB
 */
async function compressImage(file, { maxPx = 1200, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width <= maxPx && height <= maxPx) {
        // Already small enough — still re-encode to JPEG to save space
      } else {
        const ratio = Math.min(maxPx / width, maxPx / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export async function uploadFile(file) {
  const compressed = await compressImage(file)
  const { uploadURL, objectPath } = await request('POST', '/storage/uploads/request-url', {
    name: compressed.name,
    size: compressed.size,
    contentType: compressed.type,
  })
  const putRes = await fetch(uploadURL, {
    method: 'PUT',
    headers: { 'Content-Type': compressed.type },
    body: compressed,
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
  cities:          () => get('/cities'),
  categories:      () => get('/categories'),
  categoryCounts:  () => get('/category-counts'),
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
  supplierReviews: (id) => get(`/suppliers/${id}/reviews`),
  submitSupplierReview: (id, data) => post(`/suppliers/${id}/reviews`, data),
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

    supplierApplications: {
      list:    ()                      => get('/admin/supplier-applications'),
      update:  (id, status, opts = {}) => patch(`/admin/supplier-applications/${id}`, { status, ...opts }),
      delete:  (id)                    => del(`/admin/supplier-applications/${id}`),
    },
    suppliers: {
      list:      ()          => get('/admin/suppliers'),
      update:    (id, data)  => patch(`/admin/suppliers/${id}`, data),
      setStatus: (id, status)=> patch(`/admin/suppliers/${id}`, { status }),
      delete:    (id)        => del(`/admin/suppliers/${id}`),
    },

  },

  suppliers:                    (p)    => get('/suppliers' + (p?.city ? `?city=${encodeURIComponent(p.city)}` : '')),
  supplier:                     (id)   => get(`/suppliers/${id}`),
  submitSupplierApplication:    (data) => post('/supplier-applications', data),
  trackSupplierApplication:     (rn)   => get(`/supplier-applications/track/${encodeURIComponent(rn)}`),
}

export default api
