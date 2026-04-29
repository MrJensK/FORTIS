# FORTIS Träningsapp — Claude Code Handoff

## Projektöversikt

**Appnamn:** FORTIS  
**Stack:** React Native + Expo (målplattform) — prototyp byggd i HTML/JS  
**Nuvarande fas:** Fas 1 klar som HTML-prototyp, redo att migreras till React Native/Expo  
**Designriktning:** Mörk header / ljus content, accent #E85D26 (orange), minimalistisk men varm

---

## Vad som är byggt (Fas 1 — HTML-prototyp)

Filen `FORTIS-app.html` innehåller en fullt fungerande prototyp med:

- **Splash screen** — 3 sek animerad intro (roterande SVG-ring + progress-bar) → auto-redirect
- **Onboarding** — 5-stegs wizard: välkommen → profil → mål → kalori/makroberäkning → klart
  - Mifflin-St Jeor-formeln för TDEE-beräkning
  - Sparar till storage efter steg 5
- **Dashboard (Hem)** — SVG-kaloriering, makro-bars (P/K/F), vattendroppar, dagens pass, streak
- **Schema** — veckostrip måndag–söndag, pass per dag, start av pass, lägg till nytt pass
- **Aktiv träning** — sets/reps/vikt per set, ✓-knappar, 60 sek vilotimer, passtimer, spara till logg
- **Övningsbibliotek** — 20 övningar, chip-filter på utrustning, fritextsök, detaljvy
- **Kostlogg** — grundlayout med måltidssektion och makrospårning (ej fullständig)
- **Profil** — profildata, stats, inställningar, reset

---

## Navigationstruktur

Bottom nav med 5 flikar:
```
[ 🏠 Hem ] [ 📅 Schema ] [ 📚 Bibliotek ] [ 🍎 Kost ] [ 👤 Profil ]
```

---

## Designbeslut (dokumenterade)

### Färger
```
Accent:     #E85D26  (orange — CTA, aktiva element)
Accent2:    #2A6AE8  (blå — kolhydrater, sekundär)
Grön:       #22A647  (fett, success)
Bakgrund:   #F2F1ED  (varm off-white)
Kort:       #FFFFFF
Text:       #141414
Muted:      #888880
Border:     rgba(0,0,0,0.09)
Dark header:#0F0F0F  (splash, aktiv träning)
```

### Filter-UX i biblioteket (beslutad best practice)
- **Utrustning** → horisontellt scrollbara toggle-chips (alltid synliga)
- **Muskelgrupp + Svårighet** → filtermodal via ikon med badge-räknare
- Filter kombineras (Ben + Kettlebell = båda måste matcha)

### Utrustningskategorier
Kroppsvikt, Hantel, Kettlebell, Skivstång, Kabelmaskin, Maskin, Motståndsband, TRX, Löpband, Medicinboll

### Muskelgruppskategorier
Bröst, Rygg, Axlar, Armar, Ben, Core, Kondition, Helkropp, Stretching

---

## Datamodeller (TypeScript-ready)

```typescript
interface Profile {
  id: string
  name: string
  gender: 'male' | 'female' | 'other'
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  goal: 'lose' | 'maintain' | 'gain'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active'
  macroGoals: MacroGoals
  createdAt: string
  updatedAt: string
}

interface MacroGoals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

interface Exercise {
  id: string
  name: string
  category: string
  muscleGroups: string[]
  secondaryMuscles: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'strength' | 'cardio' | 'flexibility'
  instructions: string[]
  gifUrl?: string
  wgerId?: number        // wger.de exercise ID — för GIF/video-hämtning via API i Fas 2
  isCustom: boolean
}

interface WorkoutSchedule {
  id: string
  name: string
  dayOfWeek?: number        // 0=mån, 6=sön
  repeatEveryXDays?: number
  exercises: ScheduledExercise[]
  estimatedMinutes: number
  muscleGroups: string[]
  createdAt: string
}

interface ScheduledExercise {
  exerciseId: string
  sets: number
  reps?: number
  durationSeconds?: number
  targetWeightKg?: number
  restSeconds: number
  notes?: string
}

interface WorkoutLogEntry {
  id: string
  scheduleId?: string
  date: string              // ISO YYYY-MM-DD
  startedAt: string
  endedAt?: string
  durationMinutes: number
  exercises: LoggedExercise[]
  notes?: string
  completedManually: boolean
}

interface LoggedExercise {
  exerciseId: string
  sets: LoggedSet[]
}

interface LoggedSet {
  reps?: number
  weightKg?: number
  durationSeconds?: number
  completed: boolean
}

interface FoodLogEntry {
  id: string
  date: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId: string
  foodName: string
  amountG: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  barcode?: string
}

interface MeasurementEntry {
  id: string
  date: string
  weightKg?: number
  waistCm?: number
  bodyFatPct?: number
  notes?: string
}

interface WaterLogEntry {
  id: string
  date: string
  totalMl: number
  entries: { time: string; ml: number }[]
}
```

---

## Lagringsnycklar

```
fortis_profile           → Profile
fortis_macrogoals        → MacroGoals
fortis_workouts          → WorkoutSchedule[]
fortis_workoutlog        → WorkoutLogEntry[]
fortis_water_YYYY-MM-DD  → number (ml)
fortis_measurements      → MeasurementEntry[]
fortis_foodlog           → FoodLogEntry[]
fortis_custom_foods      → FoodItem[]
fortis_achievements      → string[]
```

**Persistens-strategi:** Designad för direkt mappning mot `AsyncStorage` (React Native) eller `Expo SQLite`. Exportera all data som en JSON-fil via Profil → Inställningar → Exportera.

---

## Komponentstruktur (React Native / Expo)

```
src/
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout + bottom tabs
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard / Hem
│   │   ├── schedule.tsx        # Träningsschema
│   │   ├── library.tsx         # Övningsbibliotek
│   │   ├── nutrition.tsx       # Kostlogg
│   │   └── profile.tsx         # Profil & inställningar
│   ├── onboarding/
│   │   └── index.tsx           # Onboarding-wizard
│   └── workout/
│       └── [id].tsx            # Aktiv träningsvy
│
├── components/
│   ├── shared/
│   │   ├── ProgressRing.tsx    # SVG-kaloriering
│   │   ├── MacroBar.tsx        # P/K/F progress-bar
│   │   ├── WorkoutTimer.tsx    # Passtimer
│   │   ├── RestTimer.tsx       # Vilotimer-overlay
│   │   ├── ProgressionChart.tsx# Linjediagram per övning
│   │   ├── StreakBadge.tsx     # Streak-display
│   │   └── EquipChip.tsx      # Utrustningsfilter-chip
│   ├── home/
│   │   ├── CalorieCard.tsx
│   │   ├── WaterTracker.tsx
│   │   └── TodayWorkoutCard.tsx
│   ├── schedule/
│   │   ├── WeekStrip.tsx
│   │   ├── WorkoutBlock.tsx
│   │   └── AddWorkoutModal.tsx
│   ├── library/
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseDetailModal.tsx
│   │   └── FilterModal.tsx
│   ├── nutrition/
│   │   ├── MealSection.tsx
│   │   ├── AddFoodModal.tsx
│   │   ├── BarcodeScanner.tsx  # Expo Camera
│   │   └── MacroSummary.tsx
│   └── profile/
│       ├── WeightChart.tsx
│       └── Achievements.tsx
│
├── store/
│   ├── useProfileStore.ts      # Zustand store
│   ├── useWorkoutStore.ts
│   ├── useNutritionStore.ts
│   └── useMeasurementStore.ts
│
├── lib/
│   ├── storage.ts              # AsyncStorage wrapper
│   ├── macroCalc.ts            # Mifflin-St Jeor
│   ├── exportData.ts           # JSON-export
│   └── exerciseData.ts         # Alla 20+ övningar (utbyggbar)
│
└── constants/
    ├── colors.ts
    ├── exercises.ts
    └── theme.ts
```

### Tema-modulens ansvar (frikopplad från appen)

Temat ska vara en **självständig modul** — appen konsumerar det, äger det inte.

```
src/constants/theme.ts        ← THEMES-objekt + typdefinitioner
src/store/useThemeStore.ts    ← Zustand: activeTheme, setTheme(), persist
src/hooks/useTheme.ts         ← hook: returnerar aktiva CSS-värden
```

**Regler:**
- Inga färgvärden hårdkodas i komponenter — alltid via `useTheme()`
- `setTheme()` i store sköter persist (`AsyncStorage key: fortis_theme`)
- Nya teman läggs **enbart** till i `theme.ts` — inga ändringar i komponenter
- `_layout.tsx` applicerar temat på root-nivå via `ThemeProvider`

**Nuvarande teman (från HTML-prototypen):**
`fortis` · `dark` · `midnight` · `forest` · `stone`

---

## Fas-plan

| Fas | Innehåll | Status |
|-----|----------|--------|
| **Fas 1** | Splash, Onboarding, Dashboard, Schema, Aktiv träning, Bibliotek (grund) | ✅ Klar (HTML-prototyp) |
| **Fas 2** | Progressionsgraf per övning, Achievements/streaks, Utbyggt bibliotek (GIFs) | 🔄 Pågår |
| **Fas 3** | Fullständig kostlogg, Makrospårning, Matdatabas-sökning, Vattenlogg | 🔜 |
| **Fas 4** | Barcodeläsare, Open Food Facts API, Notifikationer, Invägningsdag | 🔜 |
| **Fas 5** | React Native-migration, offline-stöd, push-notiser, App Store | 🔜 |

---

## Tech Stack (produktion)

| Komponent | Val |
|-----------|-----|
| Framework | React Native + Expo SDK 51+ |
| Routing | Expo Router (file-based) |
| State | Zustand |
| Persistens | AsyncStorage + Expo SQLite |
| Charts | Victory Native |
| Animationer | React Native Reanimated 3 |
| Barcode | Expo Camera + expo-barcode-scanner |
| Matdatabas | Open Food Facts API (https://world.openfoodfacts.org/api/v0/product/{barcode}.json) |
| Icons | Expo Vector Icons / Lucide RN |
| Notiser | Expo Notifications |

---

## Övnings-dataset (nuvarande 20 st)

```typescript
// Finns i HTML-prototypen, extrahera till src/constants/exercises.ts
// Struktur per övning:
{
  id: 'pushup',
  name: 'Armhävningar',
  muscle: 'Bröst',          // primär
  secondary: 'Triceps, Axlar',
  equip: 'Kroppsvikt',
  icon: '💪',
  diff: 'Nybörjare',
  type: 'Styrka',
  isTimer: false,            // true = tidsbaserad (plank etc.)
  instructions: string[]
}
```

Utöka till minst 100 övningar i Fas 2. Strukturen är exportklar.

---

## Export-format (JSON)

```json
{
  "exportVersion": "1.0",
  "exportedAt": "ISO-timestamp",
  "profile": { },
  "workoutSchedules": [ ],
  "workoutLog": [ ],
  "foodLog": [ ],
  "measurements": [ ],
  "waterLog": [ ],
  "customFoods": [ ]
}
```

---

## Känd teknisk skuld / TODO

- [x] Filtermodal (muskelgrupp + svårighet) — implementerad i prototypen
- [x] Övningsdatabas utökad till 75 övningar (från wger.de)
- [ ] Migrera tema-system till frikopplad modul (`theme.ts` + `useThemeStore.ts` + `useTheme()`) — inga färger hårdkodas i komponenter
- [ ] Lägg till `wgerId` på alla 75 övningar i `exerciseData.ts` vid RN-migration — möjliggör GIF/video-hämtning via `GET https://wger.de/api/v2/exerciseinfo/{wgerId}/`
- [x] Användardefinierade övningar — formulär i biblioteket, `isCustom: true`, persist i `fortis_custom_exercises`, EGEN-badge + radering
- [x] Kostlogg — 30 livsmedel, sök-modal per måltid, gram-input, live makrobars + kaloriräknare, persist i `fortis_foodlog`
- [ ] Barcodeläsare är stub — kräver Expo Camera i RN
- [x] Progressionsgraf — SVG-linjediagram per övning, PR-markering, stats (PR/pass/senast), nås via "Se progression" i övningsdetaljvyn
- [x] Vilotimerns längd — använder nu `restSec` från övningskonfigurationen (fallback 60s)
- [ ] Inga notifikationer ännu
- [x] Onboarding kan hoppas över — "Hoppa över" på steg 1, skapar profil med defaults direkt

---

## Starta prototypen

Öppna `FORTIS-app.html` direkt i webbläsaren. All data sparas i `window.storage` (Claude artifact API) — byt mot `AsyncStorage` i RN.

---

*Handoff skapad: 2026-04-29*
