import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useThemeStore } from '../src/store/useThemeStore'
import { useProfileStore } from '../src/store/useProfileStore'
import { useWorkoutStore } from '../src/store/useWorkoutStore'
import { useNutritionStore } from '../src/store/useNutritionStore'
import { useMeasurementsStore } from '../src/store/useMeasurementsStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts)
  const loadNutrition = useNutritionStore((s) => s.loadNutrition)
  const loadMeasurements = useMeasurementsStore((s) => s.loadMeasurements)
  const hasLoaded = useProfileStore((s) => s.hasLoaded)
  const profile = useProfileStore((s) => s.profile)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    Promise.all([loadTheme(), loadProfile(), loadWorkouts(), loadNutrition(), loadMeasurements()]).then(() => {
      SplashScreen.hideAsync()
    })
  }, [])

  // Route guard — runs after stores have loaded
  useEffect(() => {
    if (!hasLoaded) return
    const inOnboarding = segments[0] === 'onboarding'
    if (!profile && !inOnboarding) {
      router.replace('/onboarding')
    } else if (profile && inOnboarding) {
      router.replace('/(tabs)')
    }
  }, [hasLoaded, profile])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="workout/[id]" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  )
}
