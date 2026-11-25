import { create } from 'zustand'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
  } catch {
    return 'dark'
  }
}

function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
  }
}

const initialTheme = getInitialTheme()
applyThemeToDOM(initialTheme)

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark',

  setTheme: (theme) => {
    const nextTheme = theme === 'light' ? 'light' : 'dark'
    try {
      localStorage.setItem('theme', nextTheme)
    } catch {
      /* ignore */
    }
    applyThemeToDOM(nextTheme)
    set({ theme: nextTheme, isDark: nextTheme === 'dark' })
  },

  toggle: () => {
    const current = get().theme
    const next = current === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))

export default useThemeStore
