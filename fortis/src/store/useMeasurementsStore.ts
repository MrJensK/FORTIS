import { create } from 'zustand'
import { MeasurementEntry } from '../constants/types'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage'

interface MeasurementsStore {
  measurements: MeasurementEntry[]
  loadMeasurements: () => Promise<void>
  addMeasurement: (entry: MeasurementEntry) => Promise<void>
  removeMeasurement: (id: string) => Promise<void>
}

export const useMeasurementsStore = create<MeasurementsStore>((set, get) => ({
  measurements: [],

  loadMeasurements: async () => {
    const measurements = await storageGet<MeasurementEntry[]>(STORAGE_KEYS.measurements, [])
    set({ measurements })
  },

  addMeasurement: async (entry) => {
    const measurements = [entry, ...get().measurements]
    set({ measurements })
    await storageSet(STORAGE_KEYS.measurements, measurements)
  },

  removeMeasurement: async (id) => {
    const measurements = get().measurements.filter((m) => m.id !== id)
    set({ measurements })
    await storageSet(STORAGE_KEYS.measurements, measurements)
  },
}))
