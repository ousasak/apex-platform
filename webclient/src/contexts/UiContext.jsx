import React, { createContext, useContext, useState } from 'react'
import { useToastStore } from '../stores/toastStore'

const UiContext = createContext(null)

export function UiProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const toasts = useToastStore((s) => s.toasts)
  const showToast = useToastStore((s) => s.showToast)
  const removeToast = useToastStore((s) => s.removeToast)

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  return (
    <UiContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        toasts,
        showToast,
        removeToast,
        loading,
        setLoading,
      }}
    >
      {children}
    </UiContext.Provider>
  )
}

export function useUi() {
  const context = useContext(UiContext)
  if (!context) {
    const showToast = useToastStore.getState().showToast
    const removeToast = useToastStore.getState().removeToast
    return {
      sidebarOpen: true,
      setSidebarOpen: () => {},
      toggleSidebar: () => {},
      toasts: useToastStore.getState().toasts,
      showToast,
      removeToast,
      loading: false,
      setLoading: () => {},
    }
  }
  return context
}

export default useUi
