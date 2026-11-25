import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const theme = useThemeStore((state) => state.theme)
  const isDark = useThemeStore((state) => state.isDark)
  const toggle = useThemeStore((state) => state.toggle)
  const setTheme = useThemeStore((state) => state.setTheme)

  return {
    theme,
    isDark,
    toggle,
    setTheme,
  }
}

export default useTheme
