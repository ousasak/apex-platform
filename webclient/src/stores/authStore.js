import { create } from 'zustand'
import apiClient from '../api/client'
import { resolveMediaUrl } from '../utils/media'

function normalizeUser(userData) {
  if (!userData) return userData
  return {
    ...userData,
    avatar: resolveMediaUrl(userData.avatar),
  }
}

function getStoredToken() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token') || null
  } catch {
    return null
  }
}

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? normalizeUser(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function computeAuthMeta(user, token) {
  const roleName = user?.role?.name || ''
  return {
    isAuthenticated: !!token,
    roleName,
    isSuperAdmin: roleName === 'superadmin',
    isAdmin: ['admin', 'superadmin'].includes(roleName),
    isMember: ['member', 'admin', 'superadmin'].includes(roleName),
  }
}

const initialToken = getStoredToken()
const initialUser = getStoredUser()

const defaultPermissions = {
  projects: { can_create: false, can_update: false, can_delete: false },
  categories: { can_create: false, can_update: false, can_delete: false },
  tags: { can_create: false, can_update: false, can_delete: false },
  team_members: { can_create: false, can_update: false, can_delete: false },
  blog_posts: { can_create: false, can_update: false, can_delete: false },
  media: { can_create: false, can_update: false, can_delete: false },
}

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  user: initialUser,
  loading: false,
  permissions: defaultPermissions,
  ...computeAuthMeta(initialUser, initialToken),

  canDo: (resource, action) => {
    const roleName = get().user?.role?.name || get().roleName || ''
    if (roleName === 'superadmin') return true
    return get().permissions?.[resource]?.[`can_${action}`] ?? false
  },

  fetchPermissions: async () => {
    const token = get().token || getStoredToken()
    if (!token) return
    try {
      const { data } = await apiClient.get('/admin/my-permissions')
      if (data?.data) {
        set({ permissions: data.data })
      }
      return data?.data
    } catch {
      return null
    }
  },

  fetchMe: async () => {
    const token = get().token || getStoredToken()
    if (!token) return null
    set({ loading: true })
    try {
      const { data } = await apiClient.get('/auth/me')
      const normalized = normalizeUser(data.data)
      set({ token, user: normalized, ...computeAuthMeta(normalized, token) })
      try {
        localStorage.setItem('auth_user', JSON.stringify(normalized))
      } catch {
        /* ignore */
      }
      if (['admin', 'superadmin'].includes(normalized?.role?.name)) {
        await get().fetchPermissions()
      }
      return normalized
    } catch (error) {
      if (error?.response?.status === 401) {
        await get().logout()
      }
      throw error
    } finally {
      set({ loading: false })
    }
  },

  login: async (credentials) => {
    set({ loading: true })
    try {
      const { data } = await apiClient.post('/auth/login', credentials)
      const authToken = data.data.token
      const authUser = normalizeUser(data.data.user)

      set({
        token: authToken,
        user: authUser,
        ...computeAuthMeta(authUser, authToken),
      })
      try {
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(authUser))
      } catch {
        /* ignore */
      }

      if (['admin', 'superadmin'].includes(authUser?.role?.name)) {
        await get().fetchPermissions()
      }
      return data
    } finally {
      set({ loading: false })
    }
  },

  register: async (formData) => {
    set({ loading: true })
    try {
      const { data } = await apiClient.post('/auth/register', formData)
      const authToken = data.data.token
      const authUser = normalizeUser(data.data.user)

      set({
        token: authToken,
        user: authUser,
        ...computeAuthMeta(authUser, authToken),
      })
      try {
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(authUser))
      } catch {
        /* ignore */
      }

      if (['admin', 'superadmin'].includes(authUser?.role?.name)) {
        await get().fetchPermissions()
      }
      return data
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    const previousToken = get().token
    set({
      token: null,
      user: null,
      permissions: defaultPermissions,
      ...computeAuthMeta(null, null),
    })

    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch {
      /* ignore */
    }

    if (previousToken) {
      try {
        await apiClient.post('/auth/logout', {}, { _skip401Handler: true })
      } catch {
        /* ignore */
      }
    }
  },

  updateProfile: async (formData) => {
    const { data } = await apiClient.put('/member/profile', formData)
    const normalized = normalizeUser(data.data)
    set({ user: normalized, ...computeAuthMeta(normalized, get().token) })
    try {
      localStorage.setItem('auth_user', JSON.stringify(normalized))
    } catch {
      /* ignore */
    }
    return data
  },

  updatePassword: async (formData) => {
    return await apiClient.put('/member/password', formData)
  },

  uploadAvatar: async (formData) => {
    const { data } = await apiClient.post('/member/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const normalized = normalizeUser(data.data)
    set({ user: normalized, ...computeAuthMeta(normalized, get().token) })
    try {
      localStorage.setItem('auth_user', JSON.stringify(normalized))
    } catch {
      /* ignore */
    }
    return data
  },

  setUser: (user) => {
    const normalized = normalizeUser(user)
    set({ user: normalized, ...computeAuthMeta(normalized, get().token) })
    try {
      localStorage.setItem('auth_user', JSON.stringify(normalized))
    } catch {
      /* ignore */
    }
  },

  setToken: (token) => {
    set({ token, ...computeAuthMeta(get().user, token) })
    try {
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    } catch {
      /* ignore */
    }
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout()
  })
}

export default useAuthStore
