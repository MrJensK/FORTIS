import { useThemeStore } from '../store/useThemeStore'
import { Theme } from '../constants/theme'

export function useTheme(): Theme {
  return useThemeStore((s) => s.theme)
}
