import { create } from 'zustand'
import { FoodLogEntry, FoodItem } from '../constants/types'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage'
import { today } from '../lib/macroCalc'

interface NutritionStore {
  foodLog: FoodLogEntry[]
  waterToday: number
  waterGoal: number
  customFoods: FoodItem[]
  loadNutrition: () => Promise<void>
  addFoodEntry: (entry: FoodLogEntry) => Promise<void>
  removeFoodEntry: (id: string) => Promise<void>
  addWater: (ml: number) => Promise<void>
  addCustomFood: (food: FoodItem) => Promise<void>
  removeCustomFood: (id: string) => Promise<void>
}

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  foodLog: [],
  waterToday: 0,
  waterGoal: 2500,
  customFoods: [],

  loadNutrition: async () => {
    const foodLog = await storageGet<FoodLogEntry[]>(STORAGE_KEYS.foodLog, [])
    const waterToday = await storageGet<number>(STORAGE_KEYS.water(today()), 0)
    const customFoods = await storageGet<FoodItem[]>(STORAGE_KEYS.customFoods, [])
    set({ foodLog, waterToday, customFoods })
  },

  addFoodEntry: async (entry) => {
    const log = [...get().foodLog, entry]
    set({ foodLog: log })
    await storageSet(STORAGE_KEYS.foodLog, log)
  },

  removeFoodEntry: async (id) => {
    const log = get().foodLog.filter((e) => e.id !== id)
    set({ foodLog: log })
    await storageSet(STORAGE_KEYS.foodLog, log)
  },

  addWater: async (ml) => {
    const next = get().waterToday + ml
    set({ waterToday: next })
    await storageSet(STORAGE_KEYS.water(today()), next)
  },

  addCustomFood: async (food) => {
    const foods = [...get().customFoods, food]
    set({ customFoods: foods })
    await storageSet(STORAGE_KEYS.customFoods, foods)
  },

  removeCustomFood: async (id) => {
    const foods = get().customFoods.filter((f) => f.id !== id)
    set({ customFoods: foods })
    await storageSet(STORAGE_KEYS.customFoods, foods)
  },
}))

export function todayFoodLog(log: FoodLogEntry[]): FoodLogEntry[] {
  return log.filter((e) => e.date === today())
}
