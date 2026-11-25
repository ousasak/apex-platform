import { useToastStore } from '../stores/toastStore'

export function useToast() {
  const store = useToastStore()

  return {
    toasts: store.toasts,
    showToast: store.showToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
  }
}

export default useToast
