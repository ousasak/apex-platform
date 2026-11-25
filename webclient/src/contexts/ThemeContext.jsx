import React from 'react'
import { useTheme } from '../hooks/useTheme'

export function ThemeProvider({ children }) {
  return <>{children}</>
}

export { useTheme }
export default useTheme
