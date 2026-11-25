import React from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthProvider({ children }) {
  // Zustand handles state persistence and actions globally
  return <>{children}</>
}

export { useAuth }
export default useAuth
