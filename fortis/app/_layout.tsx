import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useThemeStore } from '../src/store/useThemeStore'
import { useProfileStore } from '../src/store/useProfileStore'
import { useWorkoutStore } from '../src/store/useWorkoutStore'
import { useNutritionStore } from '../src/store/useNutritionStore'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const loadProfile = useProfileStore((s) => s.loadProfile)
  const loadWorkouts = useWorkoutStore((s) => s.loadWorkouts)
  const loadNutrition = useNutritionStore((s) => s.loadNutrition)
  const hasLoaded = useProfileStore((s) => s.hasLoaded)

  useEffect(() => {
    Promise.all([loadTheme(), loadProfile(), loadWorkouts(), loadNutrition()]).then(() => {
      SplashScreen.hideAsync()
    })
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="workout/[id]" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  )
}
