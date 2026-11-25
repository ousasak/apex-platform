import React from 'react'
import { useNotifications } from '../hooks/useNotifications'

export function NotificationProvider({ children }) {
  return <>{children}</>
}

export { useNotifications }
export default useNotifications
