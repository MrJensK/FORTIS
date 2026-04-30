import { create } from 'zustand'
import { Profile, MacroGoals } from '../constants/types'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage'

interface ProfileStore {
  profile: Profile | null
  macroGoals: MacroGoals
  hasLoaded: boolean
  setProfile: (p: Profile) => Promise<void>
  setMacroGoals: (m: MacroGoals) => Promise<void>
  loadProfile: () => Promise<void>
}

const DEFAULT_MACROS: MacroGoals = { calories: 2200, proteinG: 165, carbsG: 220, fatG: 73 }

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  macroGoals: DEFAULT_MACROS,
  hasLoaded: false,

  setProfile: async (p) => {
    set({ profile: p })
    await storageSet(STORAGE_KEYS.profile, p)
  },

  setMacroGoals: async (m) => {
    set({ macroGoals: m })
    await storageSet('fortis_macrogoals', m)
  },

  loadProfile: async () => {
    const profile = await storageGet<Profile | null>(STORAGE_KEYS.profile, null)
    const macroGoals = await storageGet<MacroGoals>('fortis_macrogoals', DEFAULT_MACROS)
    set({ profile, macroGoals, hasLoaded: true })
  },
}))
