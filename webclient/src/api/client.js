import axios from 'axios'
import i18n from '../lib/i18n'

const PRODUCTION_SITE_HOSTS = ['apex-team.space', 'www.apex-team.space']

function isProductionSiteHost(hostname) {
  return PRODUCTION_SITE_HOSTS.includes(hostname)
}

function normalizeDevApiUrl(url) {
  if (!url) return url

  // In local dev, avoid hitting Nuxt app routes at :3000/api (404)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    url === '/api'
  ) {
    return 'http://127.0.0.1:8003/api'
  }

  return url
}

export function resolveApiBaseURL() {
  if (typeof window !== 'undefined' && isProductionSiteHost(window.location.hostname)) {
    return '/api'
  }

  if (typeof window === 'undefined') {
    const proxyTarget =
      process.env.NUXT_API_PROXY_TARGET ||
      process.env.BACKEND_URL ||
      'https://api.apex-team.space'
    return `${String(proxyTarget).replace(/\/$/, '')}/api`
  }

  return normalizeDevApiUrl(
    import.meta.env.VITE_API_URL || import.meta.env.NUXT_PUBLIC_API_URL || 'http://127.0.0.1:8003/api'
  )
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

let isHandlingUnauthorized = false

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      const locale = localStorage.getItem('i18nextLng') || 'en'
      config.headers['Accept-Language'] = locale
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => {
    // When an admin action is intercepted (queued for super-admin approval)
    if (response.status === 202 && response.data?.intercepted) {
      const err = new Error(
        response.data.message || i18n.t('api.queuedForApproval', { ns: 'common' })
      )
      err.response = response
      return Promise.reject(err)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '')
      const skip401Handler =
        !!error.config?._skip401Handler ||
        requestUrl.includes('/auth/logout') ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register')

      if (skip401Handler) {
        return Promise.reject(error)
      }

      const hadToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
      if (!hadToken) {
        return Promise.reject(error)
      }

      if (isHandlingUnauthorized) {
        return Promise.reject(error)
      }

      isHandlingUnauthorized = true
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        window.dispatchEvent(new Event('auth:unauthorized'))
        const alreadyOnLogin = window.location.pathname.startsWith('/auth/login')
        if (!alreadyOnLogin) {
          window.location.href = '/auth/login'
        }
        setTimeout(() => {
          isHandlingUnauthorized = false
        }, 1500)
      }
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60
      error.message = i18n.t('api.tooManyRequests', { ns: 'common', seconds: retryAfter })
    }

    return Promise.reject(error)
  }
)

export default apiClient
