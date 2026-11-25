import { useAuthStore } from '../stores/authStore'

export function usePermission() {
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const isMember = useAuthStore((state) => state.isMember)
  const permissions = useAuthStore((state) => state.permissions)
  const canDo = useAuthStore((state) => state.canDo)

  const hasPermission = (resource, action) => {
    return canDo(resource, action)
  }

  return {
    isSuperAdmin,
    isAdmin,
    isMember,
    permissions,
    hasPermission,
    canDo,
  }
}

export default usePermission
