import AsyncStorage from '@react-native-async-storage/async-storage'

export async function storageGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export async function storageSet(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export async function storageRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch {}
}

export const STORAGE_KEYS = {
  profile: 'fortis_profile',
  workouts: 'fortis_workouts',
  workoutLog: 'fortis_workoutlog',
  achievements: 'fortis_achievements',
  foodLog: 'fortis_foodlog',
  customFoods: 'fortis_custom_foods',
  customExercises: 'fortis_custom_exercises',
  measurements: 'fortis_measurements',
  theme: 'fortis_theme',
  water: (date: string) => `fortis_water_${date}`,
} as const
