import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const store = useAuthStore()

  const roleName = store.user?.role?.name || store.roleName || ''
  const isSuperAdmin = roleName === 'superadmin' || !!store.isSuperAdmin
  const isAdmin = ['admin', 'superadmin'].includes(roleName) || !!store.isAdmin
  const isMember = ['member', 'admin', 'superadmin'].includes(roleName) || !!store.isMember
  const isAuthenticated = !!store.token || !!store.isAuthenticated

  return {
    user: store.user,
    token: store.token,
    loading: store.loading,
    permissions: store.permissions,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isMember,
    roleName,
    canDo: (resource, action) => {
      if (isSuperAdmin) return true
      return store.permissions?.[resource]?.[`can_${action}`] ?? false
    },
    login: store.login,
    register: store.register,
    logout: store.logout,
    fetchMe: store.fetchMe,
    fetchPermissions: store.fetchPermissions,
    updateProfile: store.updateProfile,
    updatePassword: store.updatePassword,
    uploadAvatar: store.uploadAvatar,
    setUser: store.setUser,
    setToken: store.setToken,
  }
}

export default useAuth
