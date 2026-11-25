import { create } from 'zustand'

let toastCounter = 0

export const useToastStore = create((set, get) => ({
  toasts: [],

  showToast: (message, type = 'success', duration = 4000) => {
    const id = ++toastCounter
    const newToast = { id, message, type }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  success: (message, duration) => get().showToast(message, 'success', duration),
  error: (message, duration) => get().showToast(message, 'error', duration),
  warning: (message, duration) => get().showToast(message, 'warning', duration),
  info: (message, duration) => get().showToast(message, 'info', duration),

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => set({ toasts: [] }),
}))

export default useToastStore
