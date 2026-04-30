import { create } from 'zustand'
import { DEFAULT_THEME_ID, THEMES, Theme } from '../constants/theme'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage'

interface ThemeStore {
  themeId: string
  theme: Theme
  setTheme: (id: string) => Promise<void>
  loadTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeId: DEFAULT_THEME_ID,
  theme: THEMES[DEFAULT_THEME_ID],

  setTheme: async (id) => {
    const theme = THEMES[id] ?? THEMES[DEFAULT_THEME_ID]
    set({ themeId: id, theme })
    await storageSet(STORAGE_KEYS.theme, id)
  },

  loadTheme: async () => {
    const id = await storageGet<string>(STORAGE_KEYS.theme, DEFAULT_THEME_ID)
    const theme = THEMES[id] ?? THEMES[DEFAULT_THEME_ID]
    set({ themeId: id, theme })
  },
}))
