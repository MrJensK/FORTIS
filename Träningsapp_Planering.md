# Träningsapp — Planeringsspecifikation
**Version:** 1.1  
**Status:** Planeringsfas  
**Målplattform:** JSX (prototyp) → React Native / Expo (produktion)

---

## 1. Appöversikt

En fullständig personlig tränings- och hälsoapp med fokus på progressionsspårning, kostlogg och schemaläggning. Designad med en exporterbar datamodell för smidig migrering till React Native.

---

## 2. Navigationstruktur

**Bottom navigation — 5 flikar:**

```
[ 🏠 Hem ]  [ 📅 Schema ]  [ 📚 Bibliotek ]  [ 🍎 Kost ]  [ 👤 Profil ]
```

Övningsloggen nås via hemvyn och schemat (inte en egen flik).

---

## 3. Skärmar och funktioner

### 3.1 Startskärm / Splash
- Animerad välkomstbild (logo + rörlig bakgrund, t.ex. pulsande ring eller partikeleffekt)
- Varaktighet: **3 sekunder**, sedan automatisk redirect
- Om ny användare → Onboarding-flöde
- Om återvändande användare → Dashboard

---

### 3.2 Onboarding-flöde
Triggas automatiskt efter splash om ingen profil finns. **5 steg, kan hoppas över (fas 2-data fylls i senare).**

**Steg 1 — Välkommen**
- Appens namn + kort tagline
- "Kom igång"-knapp

**Steg 2 — Profil**
- Namn
- Kön (påverkar kaloriformel)
- Ålder
- Längd (cm)
- Vikt (kg)

**Steg 3 — Mål**
- Målvikt (kg)
- Mål: Gå ner / Hålla vikt / Bygga muskler
- Aktivitetsnivå: Stillasittande / Lätt aktiv / Måttligt aktiv / Mycket aktiv

**Steg 4 — Kalori- och makromål**
- Auto-beräknat via Harris-Benedict / Mifflin-St Jeor
- Visar: Kalorier / Protein / Kolhydrater / Fett
- Kan justeras manuellt

**Steg 5 — Klart**
- Sammanfattningskort
- "Starta appen"-knapp → Dashboard

---

### 3.3 Dashboard (Hemvy)
**Daglig översikt på ett ögonkast.**

- Hälsningsfras med namn och datum
- **Dagens ringindikator:** Kalorier in / Kalorier ut (cirkulär progress)
- **Dagens pass:** Nästa schemalagda pass med snabbstartknapp
- **Makrospårning:** Protein / Kolhydrater / Fett (mini progress-bars)
- **Vattenintag:** Snabblogg med + / - knappar (mål: 2–3 l)
- **Streak-banner:** Antal dagar i rad, veckomål uppnått
- **Senaste mätning:** Vikt + midjemått (om aktiverat)
- **Snabblänkar:** Logga mat / Logga pass / Se progress

---

### 3.4 Övningsbibliotek

**Sökning:**
- Fritextsökning på övningsnamn
- Sortering: A–Ö / Popularitet / Muskelgrupp

**Filter-UX — hybridmodell (best practice):**

*Nivå 1 — Horisontellt scrollbara utrustnings-chips (alltid synliga):*
Kroppsvikt / Hantel / Kettlebell / Skivstång / Kabelmaskin / Maskin / Motståndsband / TRX / Löpband / Medicinboll

Aktiv chip = fylld bakgrund. Direkt synliga eftersom utrustning är det vanligaste filtreringsbehovet — folk vet vad de har hemma och ska inte behöva öppna ett modal för det.

*Nivå 2 — Filtermodal via ikon uppe till höger (⊞ eller sliders-ikon):*
- Muskelgrupp: Bröst / Rygg / Axlar / Armar / Ben / Core / Kondition / Helkropp / Stretching
- Svårighet: Nybörjare / Medel / Avancerad
- Övningstyp: Styrka / Kondition / Stretching / Rörlighet

Badge på filterikonen visar antal aktiva filter ("2") så man alltid ser om något är filtrerat.

Filter från båda nivåerna kombineras — t.ex. "Ben" + "Kettlebell" ger övningar som uppfyller båda.

**Övningskort visar:**
- Namn
- Primär muskelgrupp (badge)
- Sekundära muskelgrupper
- Utrustning som krävs
- GIF / animationsbild (placeholder i JSX-version, riktig media i React Native)
- Kort beskrivning av utförande
- Instruktioner steg för steg
- Knapp: "Lägg till i schema" / "Logga nu"

---

### 3.5 Träningsschema

**Översiktsvy:**
- Veckovyn som standard (mån–sön) med swipe till nästa vecka
- Varje dag visar: passets namn, antal övningar, uppskattad tid
- Muskelgruppsindikator per dag (färgkodade badges: t.ex. ben = grön, överkropp = blå)
- Vilodagar markeras automatiskt baserat på föregående dags träning

**Schemalägga ett pass:**
- Välj dag(ar)
- Lägg till övningar från biblioteket eller skapa fritt
- Alternativ: Återkommande (varje måndag / var 3:e dag / etc.)
- Passet får ett namn och uppskattad tid

**Föreslagna pass:**
- Baserat på profil och mål genereras 3–5 startmallar
- t.ex. "Helkropp 3×/vecka", "Push/Pull/Ben-split", "Konditionspass"

**Starta ett pass (aktiv träningsvy):**
- Övningslista med set / reps / vikt per set
- Inbyggd timer för tidsbaserade övningar (plank, löpband etc.)
- Vilotimer mellan set (kan ställas in per övning)
- Möjlighet att justera vikt/reps live under passet
- "Nästa set" / "Hoppa över" / "Avsluta pass"
- Sammanfattning vid avslutat pass

---

### 3.6 Kost- och kalorilogg

**Daglig logg:**
- Indelad per måltid: Frukost / Lunch / Middag / Mellanmål
- Kalorier + makros per måltid och totalt
- Visuell dagstracker: Kalorier kvar av mål (cirkel + siffra)
- Makrofördelning: Stapel- eller pajdiagram (Protein / Kolhydrater / Fett)

**Lägga till mat:**
- Sök i databas (Open Food Facts API eller liknande)
- Skanna streckkod / QR-kod på förpackning (kamerafunktion i React Native, simulerad i JSX)
- Egna livsmedel kan sparas
- Favoriter / senast använda snabbval

**Mål och beräkning:**
- Automatberäkning vid onboarding (Harris-Benedict)
- Kan justeras manuellt när som helst
- TDEE-kalkylator med aktivitetsmultiplikator
- Underskott/överskott visas tydligt

**Makromål:**
- Gram och procent av totalt kaloriintag
- Standard: 30% protein / 40% kolhydrater / 30% fett (justerbart)

**Vattenintag:**
- Dagmål (standard 2,5 l)
- Snabbknappar: +2,5 dl / +5 dl / +1 l
- Visuell progress-bar

**Invägning och mätningar (kan avaktiveras):**
- Vikt (kg) — valfri frekvens
- Midjemått (cm)
- Kan läggas till: BMI, fettprocent (manuell inmatning)
- Påminnelse om invägningsdag (t.ex. varje måndag morgon)

**Veckospårning:**
- Stapeldiagram: Kalorier per dag senaste 7 dagar
- Genomsnitt vs mål
- Makrofördelning per vecka

---

### 3.7 Övningslogg och Progression

**Logg:**
- Alla genomförda pass med datum, tid, varaktighet
- Klarmarkering i efterhand möjlig
- Redigera loggat pass (justera reps/vikt)

**Per övning — progressionsgraf:**
- Linjediagram: Max vikt över tid
- Total volym (sets × reps × vikt) per session
- Bästa insats (PR) markeras tydligt
- Jämförelse: Denna vecka vs förra vecka

**Statistik:**
- Totalt antal pass
- Totalt antal träningstimmar
- Streak (nuvarande och bästa)
- Mest tränade muskelgrupp
- Veckofördelning (vilket säsongsvis mönster)

---

### 3.8 Profil och inställningar

**Profil:**
- Bild, namn, mål
- Aktuell vikt + målvikt
- Progressionskurva vikt över tid

**Inställningar:**
- Enheter: kg/cm vs lbs/inch
- Notifikationer: Påminnelser för pass, invägning, vattenintag
- Invägning: Aktivera/avaktivera + frekvens
- Tema: Ljust / Mörkt / System
- Exportera data (JSON)
- Rensa data

**Streaks och achievements:**
- Nuvarande streak (dagar i rad med loggat pass)
- Achievements: "Första passet", "7-dagarsstreak", "100 pass", "PR på bänkpress" etc.
- Veckomål: x pass per vecka, inställningsbart

---

## 4. Onboarding-flöde (detaljerat)

```
App startar
    │
    ▼ (efter 3 sek splash)
    │
    ├── Finns profil? ──── JA ──► Dashboard
    │
    └── NEJ
         │
         ▼
    [Steg 1: Välkommen]
         │
         ▼
    [Steg 2: Profil — namn, kön, ålder, längd, vikt]
         │
         ▼
    [Steg 3: Mål — målvikt, syfte, aktivitetsnivå]
         │
         ▼
    [Steg 4: Kalori- och makromål — auto + manuell justering]
         │
         ▼
    [Steg 5: Klart — sammanfattning]
         │
         ▼
    Dashboard
```

---

## 5. Data-persistensmodell (export-redo)

Designad för att direkt kunna mappas mot AsyncStorage (React Native) eller SQLite (Expo SQLite).

### 5.1 Lagringsnycklar (flat JSON / key-value)

```
profile                  → ProfileObject
settings                 → SettingsObject
exercises_library        → ExerciseObject[]
workout_schedules        → ScheduleObject[]
workout_log              → WorkoutLogEntry[]
food_log                 → FoodLogEntry[]
measurements             → MeasurementEntry[]
water_log                → WaterLogEntry[]
custom_foods             → FoodItem[]
achievements             → AchievementObject[]
```

### 5.2 Datamodeller

```typescript
// Profil
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
  calorieMacroGoals: MacroGoals
  createdAt: string
  updatedAt: string
}

// Makromål
interface MacroGoals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

// Övning
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
  isCustom: boolean
}

// Träningsschema
interface WorkoutSchedule {
  id: string
  name: string
  dayOfWeek?: number          // 0=mån, 6=sön
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

// Träningslogg
interface WorkoutLogEntry {
  id: string
  scheduleId?: string
  date: string
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

// Matlogg
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

// Livsmedel
interface FoodItem {
  id: string
  name: string
  brand?: string
  barcode?: string
  per100g: {
    calories: number
    proteinG: number
    carbsG: number
    fatG: number
  }
  isCustom: boolean
}

// Mätningar
interface MeasurementEntry {
  id: string
  date: string
  weightKg?: number
  waistCm?: number
  bodyFatPct?: number
  notes?: string
}

// Vattenlogg
interface WaterLogEntry {
  id: string
  date: string
  totalMl: number
  entries: { time: string; ml: number }[]
}
```

### 5.3 Exportformat

```json
{
  "exportVersion": "1.0",
  "exportedAt": "2025-06-01T08:00:00Z",
  "profile": { ... },
  "exerciseLibrary": [ ... ],
  "workoutSchedules": [ ... ],
  "workoutLog": [ ... ],
  "foodLog": [ ... ],
  "measurements": [ ... ],
  "waterLog": [ ... ],
  "customFoods": [ ... ]
}
```

Export triggas via Profil → Inställningar → Exportera data → JSON-fil.

---

## 6. Komponentstruktur (JSX)

```
App
├── SplashScreen
├── OnboardingFlow
│   ├── OnboardingStep1_Welcome
│   ├── OnboardingStep2_Profile
│   ├── OnboardingStep3_Goals
│   ├── OnboardingStep4_Macros
│   └── OnboardingStep5_Done
├── BottomNav
├── screens/
│   ├── DashboardScreen
│   ├── ScheduleScreen
│   │   ├── WeekView
│   │   ├── DayDetail
│   │   ├── AddWorkoutModal
│   │   └── ActiveWorkoutView
│   ├── LibraryScreen
│   │   ├── ExerciseSearch
│   │   ├── ExerciseCard
│   │   └── ExerciseDetailModal
│   ├── NutritionScreen
│   │   ├── DailyFoodLog
│   │   ├── MacroSummary
│   │   ├── AddFoodModal
│   │   ├── BarcodeScanner (stub i JSX)
│   │   └── WaterTracker
│   └── ProfileScreen
│       ├── ProfileHeader
│       ├── WeightProgressChart
│       ├── Achievements
│       └── SettingsPanel
└── shared/
    ├── ProgressRing
    ├── MacroBar
    ├── WorkoutTimer
    ├── RestTimer
    ├── ProgressionChart
    └── StreakBadge
```

---

## 7. Fas-indelning

| Fas | Innehåll | Prioritet |
|-----|----------|-----------|
| **Fas 1** | Splash + Onboarding, Dashboard, Övningslogg, Träningsschema (grundläggande) | Hög |
| **Fas 2** | Övningsbibliotek, Progressionsgraf, Streak/Achievements | Hög |
| **Fas 3** | Kostlogg, Kaloriräknare, Makrospårning, Vattenintag | Medel |
| **Fas 4** | Barcodeläsare, Open Food Facts-integration, Notifikationer | Lägre |
| **Fas 5** | Export till React Native, offline-stöd, push-notiser | Migration |

---

## 8. Teknisk stack

| Komponent | JSX-prototyp | React Native (produktion) |
|-----------|-------------|--------------------------|
| UI-framework | React (JSX artifact) | React Native + Expo |
| State | useState / useReducer | Zustand eller Redux Toolkit |
| Persistens | window.storage API | AsyncStorage / Expo SQLite |
| Navigation | Tab-state i JS | React Navigation v6 |
| Charts | Recharts (CDN) | Victory Native / react-native-chart-kit |
| Barcode | Simulerad | Expo Camera + Barcode Scanner |
| Animationer | CSS transitions | React Native Animated / Reanimated |
| Matdatabas | Mock-data | Open Food Facts API |

---

*Dokument uppdaterat: 2025-04-29*
