# FORTIS — Tränings- och hälsoapp

> Personlig träningsapp med fokus på progressionsspårning, kostlogg och schemaläggning.  
> Prototyp byggd i HTML/JS — målplattform React Native + Expo.

---

## Innehåll

- [Kom igång](#kom-igång)
- [Funktioner](#funktioner)
- [Skärmar](#skärmar)
- [Övningsbibliotek](#övningsbibliotek)
- [Kostdatabas](#kostdatabas)
- [Tema-system](#tema-system)
- [Achievements](#achievements)
- [Datalagring](#datalagring)
- [Datamodeller](#datamodeller)
- [Arkitektur (React Native)](#arkitektur-react-native)
- [Roadmap](#roadmap)
- [Tech stack](#tech-stack)

---

## Kom igång

Prototypen är en enda HTML-fil — ingen installation krävs.

```bash
# Öppna direkt i webbläsaren
open FORTIS-app.html
```

All data sparas i `window.storage` (Claude artifact API) under development.  
Vid React Native-migration byts detta mot `AsyncStorage` / `Expo SQLite`.

---

## Funktioner

### Implementerat i HTML-prototypen

| Funktion | Status | Detaljer |
|---|---|---|
| Splash screen | ✅ | 3 sek animerad SVG-ring + progress-bar → auto-redirect |
| Onboarding | ✅ | 5-stegs wizard, Mifflin-St Jeor TDEE-beräkning, kan hoppas över |
| Dashboard | ✅ | SVG-kaloriering, makrobars, vattenspårning, dagens pass, streak |
| Träningsschema | ✅ | Veckostrip mån–sön, pass per dag, lägg till/ta bort |
| Aktiv träning | ✅ | Sets/reps/vikt, vilotimer (per övning), passtimer, spara till logg |
| Övningsbibliotek | ✅ | 75 övningar, utrustningschips, filtermodal (muskelgrupp + svårighet), sök |
| Egna övningar | ✅ | Skapa/ta bort egna övningar, EGEN-badge, persist i `fortis_custom_exercises` |
| Progressionsgraf | ✅ | SVG-linjediagram per övning, PR-markering, statistik |
| Kostlogg | ✅ | 30 livsmedel, sök per måltid, gram-input, live makrobars |
| Achievements | ✅ | 10 achievements, toast-notis vid upplåsning, grid i profil |
| Tema-system | ✅ | 5 teman, väljs i Profil, persist i storage |
| Profil & stats | ✅ | Profildata, pass totalt, streak, viktmål, inställningar |

### Ej implementerat ännu (kräver React Native)

| Funktion | Fas | Blockerat av |
|---|---|---|
| Barcodeläsare | 4 | Expo Camera |
| Open Food Facts API | 4 | Native network + barcode |
| Push-notifikationer | 4 | Expo Notifications |
| Invägningsdag med påminnelse | 4 | Notifications |
| Progressionsgraf med Victory Native | 5 | RN-migration |
| Offline-stöd | 5 | RN-migration |

---

## Skärmar

### 🏠 Hem (Dashboard)
Daglig översikt på ett ögonkast:
- **Kaloriering** — SVG-cirkel med kcal in / mål, dynamisk färgfyllning
- **Makrobars** — Protein / Kolhydrater / Fett med procent-fill
- **Vattenspårning** — visuella droppar, +2,5 dl snabbknapp, dagsmål 2 500 ml
- **Dagens pass** — namn, antal övningar, snabbstart-knapp
- **Streak-pill** — antal dagar i rad med loggat pass

### 📅 Schema
- Veckostrip måndag–söndag, aktiv dag markerad
- Pass per dag med övningslista
- Lägg till nytt pass (namn + dag)
- Starta pass direkt → aktiv träningsvy

#### Aktiv träning (modal)
- Varje övning med sets × reps × vikt, editerbara live
- ✓-knapp per set → startar vilotimer (tid konfigurerad per övning)
- Passtimer (MM:SS) i headern
- Avsluta → sparar till träningslogg

### 📚 Övningsbibliotek
**Filtreringssystem — hybrid-UX:**
- *Nivå 1:* Horisontellt scrollbara utrustningschips (alltid synliga)
- *Nivå 2:* Filtermodal via Filter-knapp — muskelgrupp + svårighet
- Fritextsök i realtid
- Badge på filterknappen visar antal aktiva filter

**Övningskort visar:** namn, primär muskelgrupp, utrustning, svårighet  
**Detaljvy:** steg-för-steg instruktioner, sekundära muskler  
**Progressionsvy:** SVG-linjediagram, PR-markering, stats (PR / antal pass / senast loggat)

### 🍎 Kost
- **Summarykortet** — kcal loggat / kvar, live makrobars
- **Måltidssektioner:** Frukost / Lunch / Middag / Mellanmål
- "+ Lägg till" per måltid → sök-modal med 30 livsmedel
- Välj livsmedel → ange gram → bekräfta → makron beräknas automatiskt
- ✕ på loggad post tar bort direkt, makrona uppdateras

### 👤 Profil
- Avatar med initialer, namn, mål + aktuell vikt
- Stats: pass totalt · streak · vikt
- **Achievements-grid** — 10 achievements, låsta 38% opacity
- **Tema-väljare** — 5 färgswatches
- Inställningar: kalorimål, protein, längd, målvikt, vattenmål
- Återställ app (rensar all data)

---

## Övningsbibliotek

75 övningar hämtade från [wger.de](https://wger.de) + egna (engelska namn, kan översättas).

### Fördelning per muskelgrupp

| Muskelgrupp | Antal |
|---|---|
| Ben | 18 |
| Rygg | 11 |
| Core | 11 |
| Bröst | 10 |
| Armar | 9 |
| Axlar | 8 |
| Kondition | 7 |
| Helkropp | 1 |

### Fördelning per utrustning

| Utrustning | Antal |
|---|---|
| Kroppsvikt | 33 |
| Hantel | 19 |
| Skivstång | 7 |
| Maskin | 6 |
| Kabelmaskin | 5 |
| Kettlebell | 3 |
| Motståndsband | 1 |
| Löpband | 1 |

### Utöka biblioteket
Varje övning följer detta schema:
```javascript
{
  id: 'exercise_id',
  name: 'Exercise Name',
  muscle: 'Ben',           // primär muskelgrupp
  secondary: 'Rumpa, Core', // sekundära (sträng)
  equip: 'Kroppsvikt',     // måste matcha EQUIP_CHIPS
  icon: '🦵',
  diff: 'Nybörjare',       // Nybörjare | Medel | Avancerad
  type: 'Styrka',          // Styrka | Kondition | Stretching
  isTimer: false,          // true = tidsbaserad (plank, löpband etc.)
  instructions: ['Steg 1', 'Steg 2', ...]
}
```

**wger.de API** kan användas för att hämta fler övningar:
```
GET https://wger.de/api/v2/exerciseinfo/{id}/?format=json
```
Lägg till `wgerId` på övningen för att koppla mot wger och hämta GIF/video i Fas 2.

### Egna övningar

Användaren kan skapa egna övningar direkt i biblioteket via **"+ Ny övning"**-knappen.

- Fält: namn, emoji-ikon, muskelgrupp, sekundära muskler, utrustning, svårighet, typ, instruktioner (dynamiska steg)
- Sparas till `fortis_custom_exercises` i storage med `isCustom: true`
- Visas med orange **EIGEN**-badge och accentbård i listan
- Detaljvyn visar 🗑 Ta bort-knapp (enbart för egna)
- Fungerar fullt ut med aktiv träning, progression och schemaläggning

---

## Kostdatabas

30 vanliga livsmedel, alla med makrovärden per 100g.

| Kategori | Livsmedel |
|---|---|
| Kött & fisk | Kycklingfilé, Nötfärs, Lax, Tonfisk, Ägg, Räkor |
| Mejeri | Mjölk, Grekisk yoghurt, Keso, Ost, Kvarg |
| Spannmål | Havregryn, Ris, Pasta, Vitt bröd, Rågbröd, Tortilla |
| Grönsaker | Broccoli, Spenat, Potatis, Sötpotatis |
| Frukt | Banan, Äpple, Blåbär |
| Nötter & övrigt | Mandlar, Jordnötssmör, Olivolja, Avokado, Proteinpulver, Kidneybönor |

**Utöka databasen** — lägg till objekt i `FOODS`-arrayen:
```javascript
{id: 'mitt_livsmedel', name: 'Mitt Livsmedel', cal: 200, prot: 15, carbs: 20, fat: 5}
```

I Fas 4 ersätts/kompletteras detta med [Open Food Facts API](https://world.openfoodfacts.org/api/v0/product/{barcode}.json) via barcodeläsare.

---

## Tema-system

5 inbyggda teman, väljs i Profil-fliken. Alla CSS-variabler byts atomärt.

| Tema | Bakgrund | Accent | Karaktär |
|---|---|---|---|
| **Fortis** | Varm off-white `#F2F1ED` | Orange `#E85D26` | Standard, varm |
| **Dark** | Kol `#121212` | Orange `#E85D26` | Mörkt läge |
| **Midnight** | Navy `#0D1117` | Blå `#5B8BFF` | GitHub-mörkt |
| **Forest** | Naturgrön `#F0F4F0` | Grön `#2D9E5F` | Lugnt, naturligt |
| **Stone** | Cool grå `#F5F5F4` | Indigo `#6366F1` | Modernt, minimalt |

### CSS-variabler
```css
--accent        /* CTA, aktiva element */
--accent2       /* Sekundär accent, kolhydrater */
--accent-light  /* Tint av accent för bakgrunder */
--bg            /* Sidans bakgrund */
--card          /* Kortbakgrund */
--text          /* Primär text */
--muted         /* Sekundär text, labels */
--border        /* Kortlinjer, separatorer */
--nav           /* Bottom navigation */
--header        /* Mörk header (hem, bibliotek etc.) */
--header-text   /* Text i mörk header */
--outer         /* Bakgrund utanför app-ramen */
```

### React Native-migration
Temat ska vara en **frikopplad modul** — appen konsumerar, äger inte:
```
src/constants/theme.ts     ← THEMES-objekt + typdefinitioner
src/store/useThemeStore.ts ← Zustand: activeTheme, setTheme(), persist
src/hooks/useTheme.ts      ← hook: returnerar aktiva värden
```
Inga färgvärden hårdkodas i komponenter. Nya teman läggs bara till i `theme.ts`.

---

## Achievements

10 achievements som låses upp automatiskt efter avslutat pass.

| Achievement | Ikon | Villkor |
|---|---|---|
| Första passet | 🏋️ | Slutför 1 pass |
| 10 pass | 💪 | Slutför 10 pass totalt |
| 50 pass | 🏆 | Slutför 50 pass totalt |
| 100 pass | 🥇 | Slutför 100 pass totalt |
| 3 i rad | 🔥 | 3 dagars träningsstreak |
| Vecka på raken | 🔥 | 7 dagars träningsstreak |
| Månadsstreak | 🔥 | 30 dagars träningsstreak |
| Tidig fågel | 🌅 | Logga ett pass före 08:00 |
| Allrounder | 🌟 | Träna 5 olika muskelgrupper |
| Uthållighet | ⏱️ | Slutför ett pass längre än 60 min |

Toast-notis slidar in uppifrån vid upplåsning. Visas som grid i Profil med låsta achievements i 38% opacity.

---

## Datalagring

### Storage-nycklar

| Nyckel | Typ | Innehåll |
|---|---|---|
| `fortis_profile` | `Profile` | Profildata + makromål |
| `fortis_macrogoals` | `MacroGoals` | Kalorier, protein, kolhydrater, fett |
| `fortis_workouts` | `WorkoutSchedule[]` | Schemalagda pass |
| `fortis_workoutlog` | `WorkoutLogEntry[]` | Loggade genomförda pass |
| `fortis_foodlog` | `FoodLogEntry[]` | Loggad mat per dag |
| `fortis_water_YYYY-MM-DD` | `number` | Vattenintag i ml per datum |
| `fortis_measurements` | `MeasurementEntry[]` | Vikt, midjemått, fettprocent |
| `fortis_achievements` | `string[]` | Upplåsta achievement-IDs |
| `fortis_theme` | `string` | Aktivt tema-ID |
| `fortis_custom_foods` | `FoodItem[]` | Användarens egna livsmedel |
| `fortis_custom_exercises` | `Exercise[]` | Användarens egna övningar (`isCustom: true`) |

### Export-format
```json
{
  "exportVersion": "1.0",
  "exportedAt": "2026-04-29T12:00:00Z",
  "profile": {},
  "workoutSchedules": [],
  "workoutLog": [],
  "foodLog": [],
  "measurements": [],
  "waterLog": [],
  "customFoods": []
}
```
Export triggas via Profil → Exportera data → JSON-fil.

---

## Datamodeller

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
  wgerId?: number       // kopplar till wger.de API för GIF/video
  isCustom: boolean
}

interface WorkoutSchedule {
  id: string
  name: string
  dayOfWeek?: number    // 0=mån … 6=sön
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
  date: string          // ISO YYYY-MM-DD
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

interface FoodItem {
  id: string
  name: string
  brand?: string
  barcode?: string
  per100g: { calories: number; proteinG: number; carbsG: number; fatG: number }
  isCustom: boolean
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

## Arkitektur (React Native)

```
src/
├── app/                         # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root layout + ThemeProvider + bottom tabs
│   ├── (tabs)/
│   │   ├── index.tsx            # Dashboard / Hem
│   │   ├── schedule.tsx         # Träningsschema
│   │   ├── library.tsx          # Övningsbibliotek
│   │   ├── nutrition.tsx        # Kostlogg
│   │   └── profile.tsx          # Profil & inställningar
│   ├── onboarding/
│   │   └── index.tsx            # Onboarding-wizard (5 steg)
│   └── workout/
│       └── [id].tsx             # Aktiv träningsvy
│
├── components/
│   ├── shared/
│   │   ├── ProgressRing.tsx     # SVG-kaloriering
│   │   ├── MacroBar.tsx         # P/K/F progress-bar
│   │   ├── WorkoutTimer.tsx     # Passtimer
│   │   ├── RestTimer.tsx        # Vilotimer-overlay
│   │   ├── ProgressionChart.tsx # Linjediagram (Victory Native)
│   │   ├── StreakBadge.tsx      # Streak-display
│   │   └── EquipChip.tsx        # Utrustningsfilter-chip
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
│   │   ├── BarcodeScanner.tsx   # Expo Camera
│   │   └── MacroSummary.tsx
│   └── profile/
│       ├── WeightChart.tsx
│       └── Achievements.tsx
│
├── store/                       # Zustand stores
│   ├── useProfileStore.ts
│   ├── useWorkoutStore.ts
│   ├── useNutritionStore.ts
│   ├── useMeasurementStore.ts
│   └── useThemeStore.ts         # activeTheme, setTheme(), persist
│
├── hooks/
│   └── useTheme.ts              # returnerar aktiva temavärden
│
├── lib/
│   ├── storage.ts               # AsyncStorage wrapper
│   ├── macroCalc.ts             # Mifflin-St Jeor TDEE
│   ├── exportData.ts            # JSON-export
│   └── exerciseData.ts          # 75+ övningar (utbyggbar)
│
└── constants/
    ├── colors.ts
    ├── exercises.ts
    └── theme.ts                 # THEMES-objekt + typdefinitioner
```

---

## Roadmap

| Fas | Innehåll | Status |
|---|---|---|
| **Fas 1** | Splash, Onboarding, Dashboard, Schema, Aktiv träning, Bibliotek | ✅ Klar |
| **Fas 2** | Progressionsgraf, Achievements/streaks, Utbyggt bibliotek | 🔄 Pågår |
| **Fas 3** | Fullständig kostlogg, Makrospårning, Matdatabas, Vattenlogg | 🔄 Pågår |
| **Fas 4** | Barcodeläsare, Open Food Facts API, Notifikationer, Invägningsdag | 🔜 |
| **Fas 5** | React Native-migration, offline-stöd, push-notiser, App Store | 🔜 |

### Närmast kvar
- [ ] Barcodeläsare (Expo Camera) — ersätter sök-modal med skannad streckkod
- [ ] Open Food Facts API-integration
- [ ] Push-notifikationer (pass-påminnelse, vattenintag, invägningsdag)
- [ ] Egna livsmedel — `isCustom: true`, persist i `fortis_custom_foods`
- [x] Egna övningar — `isCustom: true`, persist i `fortis_custom_exercises`
- [ ] `wgerId` på alla 75 övningar vid RN-migration (GIF/video via wger API)

---

## Tech stack

| Komponent | Prototyp | Produktion (RN) |
|---|---|---|
| UI | HTML + CSS | React Native + Expo SDK 51+ |
| Routing | Tab-state i JS | Expo Router (file-based) |
| State | Globalt `ST`-objekt | Zustand |
| Persistens | `window.storage` | AsyncStorage + Expo SQLite |
| Charts | SVG (hand-built) | Victory Native |
| Animationer | CSS transitions | React Native Reanimated 3 |
| Barcode | — (stub) | Expo Camera + expo-barcode-scanner |
| Matdatabas | 30 inbyggda livsmedel | Open Food Facts API |
| Icons | Emoji | Expo Vector Icons / Lucide RN |
| Notiser | — | Expo Notifications |

### Kaloriformel
TDEE beräknas med **Mifflin-St Jeor**:

```
Män:   BMR = 10×vikt + 6.25×längd − 5×ålder + 5
Kvinnor: BMR = 10×vikt + 6.25×längd − 5×ålder − 161

TDEE = BMR × aktivitetsmultiplikator
  sedentary:   × 1.2
  light:       × 1.375
  moderate:    × 1.55
  very_active: × 1.725

Mål-justering:
  lose:     TDEE − 500 kcal
  maintain: TDEE
  gain:     TDEE + 300 kcal
```

---

*Senast uppdaterad: 2026-04-29*
