# FORTIS Träningsapp — Handoff-dokument

## Projektöversikt

**Appnamn:** FORTIS  
**Stack:** React Native + Expo SDK 54, Expo Router v6, TypeScript, Zustand  
**Nuvarande fas:** Fas 5 klar — RN-migration genomförd, appen körs fullt ut  
**Designriktning:** Mörk header / ljus content, accent `#E85D26` (orange), minimalistisk men varm

---

## Vad som är byggt

### HTML-prototyp (`FORTIS-app.html`)
Fullt fungerande prototyp med alla grundfunktioner inkl. progressionsgraf per övning. Fungerar direkt i webbläsaren, data sparas i `window.storage`.

### React Native-appen (`fortis/`)
Fullt fungerande mobilapp. Kör med `cd fortis && npx expo start`.

**Implementerade skärmar:**

| Skärm | Fil | Innehåll |
|---|---|---|
| Splash + Onboarding | `app/onboarding/index.tsx` | Animerad SVG-ring, 5-stegs wizard, TDEE-beräkning, takt-val |
| Dashboard | `app/(tabs)/index.tsx` | Kaloriering, makrobars, vattendroppar, dagens pass, streak |
| Schema | `app/(tabs)/schedule.tsx` | Veckostrip, pass per dag, starta pass |
| Aktiv träning | `app/workout/[id].tsx` | Sets/reps/vikt, vilotimer, passtimer, logga pass |
| Bibliotek | `app/(tabs)/library.tsx` | 75 övningar, filter, sök, egna övningar (+FAB, EGET-badge) |
| Kost | `app/(tabs)/nutrition.tsx` | Måltider, mat-sökning, egna livsmedel, gram-input |
| Profil | `app/(tabs)/profile.tsx` | Stats, viktgraf, mätningslogg, profil-edit, teman, achievements |

---

## Fil- och katalogstruktur

```
fortis/
├── app/
│   ├── _layout.tsx              # Root layout: laddar stores, route guard, StatusBar
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar (5 flikar, Lucide-ikoner, theme-färger)
│   │   ├── index.tsx            # Dashboard
│   │   ├── schedule.tsx         # Träningsschema
│   │   ├── library.tsx          # Övningsbibliotek
│   │   ├── nutrition.tsx        # Kostlogg
│   │   └── profile.tsx          # Profil & progress
│   ├── onboarding/
│   │   └── index.tsx            # SplashIntro + 5-stegs wizard
│   └── workout/
│       └── [id].tsx             # Aktiv träning (fullScreenModal)
│
└── src/
    ├── constants/
    │   ├── types.ts             # Alla TypeScript-gränssnitt
    │   ├── exercises.ts         # 75 övningar (Exercise[])
    │   ├── foods.ts             # 30 livsmedel (FoodItem[])
    │   └── theme.ts             # 5 teman + Theme-interface
    ├── store/
    │   ├── useProfileStore.ts   # profile, macroGoals, hasLoaded, setProfile(), setMacroGoals()
    │   ├── useWorkoutStore.ts   # workouts, workoutLog, calcStreak(), logWorkout()
    │   ├── useNutritionStore.ts # foodLog, waterToday, customFoods, addFoodEntry(), addCustomFood()
    │   ├── useMeasurementsStore.ts # measurements, addMeasurement(), removeMeasurement()
    │   └── useThemeStore.ts     # themeId, setTheme() — persist: fortis_theme
    ├── hooks/
    │   └── useTheme.ts          # Returnerar aktiva temavärden från THEMES[themeId]
    └── lib/
        ├── storage.ts           # storageGet(), storageSet(), STORAGE_KEYS
        └── macroCalc.ts         # calcTDEE(), calcMacros(), PACE_LABELS, today()
```

---

## Route guard

I `app/_layout.tsx` körs en `useEffect` på `[hasLoaded, profile]`:

```tsx
useEffect(() => {
  if (!hasLoaded) return
  const inOnboarding = segments[0] === 'onboarding'
  if (!profile && !inOnboarding) router.replace('/onboarding')
  else if (profile && inOnboarding) router.replace('/(tabs)')
}, [hasLoaded, profile])
```

**Viktigt:** `Stack.Screen name` = filsökväg (`"onboarding/index"`), `router.replace` = URL (`'/onboarding'`), `segments[0]` = URL-segment (`'onboarding'`).

---

## Tema-system

Frikopplad modul — komponenter hårdkodar aldrig färger:

```tsx
// I varje komponent:
const theme = useTheme()
// theme.accent, theme.card, theme.text, theme.muted, theme.border, etc.
```

`useThemeStore.setTheme(id)` byter tema och persisterar. Nya teman läggs enbart till i `src/constants/theme.ts`.

**Theme-interface:**
```typescript
interface Theme {
  id: string; name: string
  bg: string; card: string; outer: string
  text: string; muted: string; border: string
  accent: string; accentLight: string
  header: string; headerText: string
}
```

---

## Kaloriformel

Mifflin-St Jeor TDEE + pace-delta i `src/lib/macroCalc.ts`:

```typescript
// calcTDEE() → BMR × aktivitetsmultiplikator
// calcMacros(tdee, goal, pace, weightKg) → MacroGoals

const PACE_DELTA = {
  lose:     { slow: -250, moderate: -500, fast: -750 },
  gain:     { slow: 200,  moderate: 350,  fast: 500  },
  maintain: { slow: 0,    moderate: 0,    fast: 0    },
}
// Protein: weightKg × 2g  |  Fett: 25% av kalorier  |  Kolhydrater: resten
// Minimum: 1 200 kcal/dag
```

---

## Viktiga kända buggar & lösningar

| Problem | Orsak | Lösning |
|---|---|---|
| Functions i `StyleSheet.create()` | TS2322 — StyleSheet accepterar inte funktioner | Dela upp i `chip` + `chipActive`, använd `[s.chip, active && s.chipActive]` |
| Route name mismatch | `Stack.Screen name` = filsökväg, inte URL | `name="onboarding/index"`, `router.replace('/onboarding')` |
| ScrollView scrollas inte | `TouchableOpacity` wrapping blockerar scroll | Använd `View` (inte `TouchableOpacity`) som wrapper runt `ScrollView` i modaler |
| `paddingBottom` på ScrollView | Måste ligga i `contentContainerStyle`, inte `style` | `contentContainerStyle={{ paddingBottom: 32 }}` |
| SVG rotation web-varning | `rotation`/`origin`-props är inte valid SVG | Använd `transform="rotate(-90 65 65)"` istället |
| Expo SVG-version | `react-native-svg@15.15.4` inte kompatibel med Expo 54 | Downgraded till `15.12.1` |
| AsyncStorage-version | `@react-native-async-storage@3.0.2` ej kompatibel | Downgraded till `2.2.0` |

---

## Lagringsnycklar

```typescript
export const STORAGE_KEYS = {
  profile:          'fortis_profile',
  workouts:         'fortis_workouts',
  workoutLog:       'fortis_workoutlog',
  foodLog:          'fortis_foodlog',
  customFoods:      'fortis_custom_foods',
  customExercises:  'fortis_custom_exercises',
  measurements:     'fortis_measurements',
  theme:            'fortis_theme',
  water: (date) => `fortis_water_${date}`,
}
```

---

## Teknisk skuld / TODO

- [ ] Progressionsgraf per övning i RN (finns i HTML-prototypen — kräver aggregering av `workoutLog` per `exerciseId`)
- [ ] Barcodeläsare (Expo Camera) — streckkodsskanning för mat
- [ ] Open Food Facts API-integration (`https://world.openfoodfacts.org/api/v0/product/{barcode}.json`)
- [ ] Push-notifikationer (Expo Notifications) — pass-påminnelse, vattenintag, invägningsdag
- [ ] Export av data till JSON
- [ ] `wgerId` på alla 75 övningar (möjliggör GIF/video via `GET https://wger.de/api/v2/exerciseinfo/{id}/`)
- [ ] Redigera/ta bort schemalagda pass i schema-skärmen
- [ ] Inga notifikationer vid Achievement-upplåsning i RN (toast fanns i HTML-prototypen)

---

## Fas-plan

| Fas | Innehåll | Status |
|---|---|---|
| **Fas 1** | Splash, Onboarding, Dashboard, Schema, Aktiv träning, Bibliotek | ✅ Klar |
| **Fas 2** | Achievements/streaks, utbyggt bibliotek (75 övningar), egna övningar | ✅ Klar |
| **Fas 3** | Kostlogg, makrospårning, matdatabas, vattenlogg, egna livsmedel | ✅ Klar |
| **Fas 4** | Profil-redigering, viktgraf, mätningslogg, takt i onboarding | ✅ Klar |
| **Fas 5** | React Native + Expo migration, AsyncStorage, offline-stöd | ✅ Klar |
| **Fas 6** | Barcodeläsare, Open Food Facts API, Push-notifikationer | 🔜 Näst |

---

*Uppdaterad: 2026-05-01*
