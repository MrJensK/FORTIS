# FORTIS — Tränings- och hälsoapp

> Personlig träningsapp byggd i React Native + Expo.  
> Spårning av träning, kost, vikt och progress med 5 teman och offline-stöd.

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
- [Arkitektur](#arkitektur)
- [Roadmap](#roadmap)
- [Tech stack](#tech-stack)

---

## Kom igång

```bash
cd fortis
npx expo start
```

- **iOS Simulator:** tryck `i` i terminalen
- **Android Emulator:** tryck `a` i terminalen
- **Fysisk enhet:** skanna QR-koden med Expo Go

All data sparas lokalt med `AsyncStorage` — ingen server krävs.

---

## Funktioner

### Implementerat i React Native-appen

| Funktion | Status | Detaljer |
|---|---|---|
| Splash screen | ✅ | Animerad SVG-ring + progress-bar, 2.8 sek → fade |
| Onboarding | ✅ | 5-stegs wizard, Mifflin-St Jeor TDEE, takt-val, kan hoppas över |
| Route guard | ✅ | Redirect till onboarding om ingen profil, tillbaka vid profil |
| Dashboard | ✅ | SVG-kaloriering, makrobars, vattendroppar, dagens pass, streak |
| Träningsschema | ✅ | Veckostrip mån–sön, pass per dag, starta pass |
| Aktiv träning | ✅ | Sets/reps/vikt, vilotimer per övning, passtimer, spara till logg |
| Övningsbibliotek | ✅ | 75 övningar, utrustningschips, filtermodal (muskelgrupp + svårighet), sök |
| Egna övningar | ✅ | Skapa/ta bort egna övningar, EGET-badge, persist i `fortis_custom_exercises` |
| Kostlogg | ✅ | 30 livsmedel, sök per måltid, gram-input, live makrobars |
| Egna livsmedel | ✅ | Skapa/ta bort egna livsmedel, EGET-badge, persist i `fortis_custom_foods` |
| Mätningar | ✅ | Logga vikt, midja, fettprocent — persist i `fortis_measurements` |
| Viktgraf | ✅ | SVG-linjegraf senaste 7 mätningarna med y-axel + datumrubriker |
| Profil-redigering | ✅ | Redigera vikt, mål, takt, aktivitetsnivå — live makropreview |
| Achievements | ✅ | 10 achievements, grid i profil med låsta/upplåsta |
| Tema-system | ✅ | 5 teman, väljs i Profil, persist i `fortis_theme` |
| 5 teman | ✅ | Fortis, Dark, Midnight, Forest, Stone |

### Ej implementerat ännu

| Funktion | Fas | Blockerat av |
|---|---|---|
| Barcodeläsare | 4 | Expo Camera |
| Open Food Facts API | 4 | Native network + barcode |
| Push-notifikationer | 4 | Expo Notifications |
| Progressionsgraf per övning | — | Träningslogg saknar aggregering per övning i RN |
| Export av data (JSON) | — | Inte prioriterat ännu |

---

## Skärmar

### 🏠 Hem (Dashboard)
Daglig översikt på ett ögonkast:
- **Kaloriering** — SVG-cirkel med kcal loggat / mål
- **Makrobars** — Protein / Kolhydrater / Fett med procentfyllning
- **Vattenspårning** — visuella droppar, +250 ml snabbknapp, dagsmål 2 500 ml
- **Dagens pass** — namn + antal övningar, länk till aktiv träning
- **Streak-pill** — antal dagar i rad med loggat pass

### 📅 Schema
- Veckostrip måndag–söndag, aktiv dag markerad
- Pass per dag med övningar listade
- Starta pass direkt → aktiv träningsvy

#### Aktiv träning
- Varje övning med sets × reps × vikt, editerbara live
- ✓-knapp per set → startar vilotimer (tid från övningens `restSec`)
- Passtimer (MM:SS) i headern
- Avsluta → sparar till träningslogg

### 📚 Övningsbibliotek
**Filtreringssystem — hybrid-UX:**
- *Nivå 1:* Horisontellt scrollbara utrustningschips (alltid synliga)
- *Nivå 2:* Filtermodal — muskelgrupp + svårighet, badge visar antal aktiva
- Fritextsök i realtid

**Detaljvy:** steg-för-steg instruktioner, sekundära muskler  
**Egna övningar:** "+ Ny övning"-FAB, EGET-badge, 🗑 ta bort i detaljvy

### 🍎 Kost
- **Summarykortet** — kcal loggat / mål, live makroboxar
- **Måltidssektioner:** Frukost / Lunch / Middag / Mellanmål
- "+ Lägg till" per måltid → sök-modal med alla livsmedel
- **Egna livsmedel** — "Skapa eget livsmedel" i sök-modalen, formulär för namn + makron per 100g
- EGET-badge + 🗑-knapp på egna i listan
- ✕ på loggad post tar bort direkt

### 👤 Profil
- **Statistik** — pass totalt · streak · kcal/dag
- **Progress** — "Logga"-knapp öppnar mätningsmodal (vikt, midja, fettprocent)
  - SVG-linjegraf över senaste 7 viktmätningarna
  - Lista på 4 senaste mätningarna
- **Profil-data** — "Redigera"-knapp: vikt, målvikt, mål, takt, aktivitetsnivå + live makropreview
- **Tema-väljare** — 5 färgswatches
- **Achievements** — 10 achievements, låsta i 40% opacity
- Återställ all data

---

## Övningsbibliotek

75 övningar från [wger.de](https://wger.de) + egna.

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

### Övningsstruktur

```typescript
{
  id: 'exercise_id',
  name: 'Exercise Name',
  muscle: 'Ben',            // primär muskelgrupp
  secondary: 'Rumpa, Core', // sekundära (sträng)
  equip: 'Kroppsvikt',      // måste matcha EQUIP_CHIPS
  icon: '🦵',
  diff: 'Nybörjare',        // Nybörjare | Medel | Avancerad
  type: 'Styrka',           // Styrka | Kondition | Rörlighet
  isTimer: false,           // true = tidsbaserad (plank, löpband etc.)
  instructions: ['Steg 1', 'Steg 2', ...]
}
```

**wger.de API** för fler övningar:
```
GET https://wger.de/api/v2/exerciseinfo/{id}/?format=json
```

---

## Kostdatabas

30 vanliga livsmedel, alla med makrovärden per 100g. Egna livsmedel läggs till direkt i appen.

| Kategori | Livsmedel |
|---|---|
| Kött & fisk | Kycklingfilé, Nötfärs, Lax, Tonfisk, Ägg, Räkor |
| Mejeri | Mjölk, Grekisk yoghurt, Keso, Ost, Kvarg |
| Spannmål | Havregryn, Ris, Pasta, Vitt bröd, Rågbröd, Tortilla |
| Grönsaker | Broccoli, Spenat, Potatis, Sötpotatis |
| Frukt | Banan, Äpple, Blåbär |
| Nötter & övrigt | Mandlar, Jordnötssmör, Olivolja, Avokado, Proteinpulver, Kidneybönor |

Eget livsmedel-schema:
```typescript
{ id: 'cf123', name: 'Hemmagjord granola', cal: 420, prot: 9, carbs: 58, fat: 16, isCustom: true }
```

---

## Tema-system

5 inbyggda teman, väljs i Profil-fliken.

| Tema | Bakgrund | Accent | Karaktär |
|---|---|---|---|
| **Fortis** | Varm off-white `#F2F1ED` | Orange `#E85D26` | Standard, varm |
| **Dark** | Kol `#121212` | Orange `#E85D26` | Mörkt läge |
| **Midnight** | Navy `#0D1117` | Blå `#5B8BFF` | GitHub-mörkt |
| **Forest** | Naturgrön `#F0F4F0` | Grön `#2D9E5F` | Lugnt, naturligt |
| **Stone** | Cool grå `#F5F5F4` | Indigo `#6366F1` | Modernt, minimalt |

Tema-systemet är frikopplat:
```
src/constants/theme.ts     ← THEMES-objekt + Theme-interface
src/store/useThemeStore.ts ← Zustand: themeId, setTheme(), persist
src/hooks/useTheme.ts      ← hook: returnerar aktiva temavärden
```
Inga färgvärden hårdkodas i komponenter. Nya teman läggs enbart till i `theme.ts`.

---

## Achievements

10 achievements som låses upp baserat på träningshistorik.

| Achievement | Ikon | Villkor |
|---|---|---|
| Första steget | 🏆 | Slutför 1 pass |
| På rulle | 🔥 | 3 dagars streak |
| Veckovinnare | 🔥🔥 | 7 dagars streak |
| Hängiven | 💪 | 5 pass totalt |
| Maskin | ⚡ | 10 pass totalt |
| Elit | 👑 | 20 pass totalt |
| Morgonfågel | 🌅 | Tränat innan kl 08:00 |
| Maraton | 🏅 | 60+ min i ett pass |
| Helkropp | 🎯 | Tränat 5+ muskelgrupper |
| Personbästa | 📈 | Sätt ett personligt rekord |

---

## Datalagring

### Storage-nycklar

| Nyckel | Typ | Innehåll |
|---|---|---|
| `fortis_profile` | `Profile` | Profildata inkl. makromål |
| `fortis_workouts` | `WorkoutSchedule[]` | Schemalagda pass |
| `fortis_workoutlog` | `WorkoutLogEntry[]` | Genomförda pass |
| `fortis_foodlog` | `FoodLogEntry[]` | Loggad mat per dag |
| `fortis_water_YYYY-MM-DD` | `number` | Vattenintag i ml |
| `fortis_measurements` | `MeasurementEntry[]` | Vikt, midja, fettprocent |
| `fortis_custom_foods` | `FoodItem[]` | Egna livsmedel |
| `fortis_custom_exercises` | `Exercise[]` | Egna övningar |
| `fortis_theme` | `string` | Aktivt tema-ID |

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
  pace: 'slow' | 'moderate' | 'fast'
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
  muscle: string
  secondary?: string
  equip: string
  icon: string
  diff: 'Nybörjare' | 'Medel' | 'Avancerad'
  type: 'Styrka' | 'Kondition' | 'Rörlighet'
  isTimer?: boolean
  instructions: string[]
  wgerId?: number
  isCustom?: boolean
}

interface WorkoutSchedule {
  id: string
  name: string
  day: number         // 0=mån … 6=sön
  exercises: ScheduledExercise[]
}

interface ScheduledExercise {
  exerciseId: string
  sets: number
  reps?: number
  durationSec?: number
  weight?: number
  restSec: number
}

interface WorkoutLogEntry {
  id: string
  workoutId: string
  date: string
  startedAt: string
  endedAt?: string
  durationMin: number
  exercises: LoggedSet[][]
  completedManually: boolean
}

interface LoggedSet {
  reps?: number
  weight?: number
  durationSec?: number
  done: boolean
}

interface FoodItem {
  id: string
  name: string
  cal: number
  prot: number
  carbs: number
  fat: number
  isCustom?: boolean
}

interface FoodLogEntry {
  id: string
  date: string
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodId: string
  foodName: string
  amountG: number
  cal: number
  prot: number
  carbs: number
  fat: number
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
}
```

---

## Arkitektur

```
fortis/
├── app/
│   ├── _layout.tsx              # Root layout, store-laddning, route guard
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar med 5 flikar (Lucide-ikoner)
│   │   ├── index.tsx            # Dashboard
│   │   ├── schedule.tsx         # Träningsschema
│   │   ├── library.tsx          # Övningsbibliotek
│   │   ├── nutrition.tsx        # Kostlogg
│   │   └── profile.tsx          # Profil & progress
│   ├── onboarding/
│   │   └── index.tsx            # Splash-animation + 5-stegs wizard
│   └── workout/
│       └── [id].tsx             # Aktiv träningsvy (fullscreen modal)
│
└── src/
    ├── constants/
    │   ├── types.ts             # Alla TypeScript-gränssnitt
    │   ├── exercises.ts         # 75 övningar
    │   ├── foods.ts             # 30 livsmedel
    │   └── theme.ts             # 5 teman + Theme-interface
    ├── store/
    │   ├── useProfileStore.ts   # Zustand: profile, macroGoals, hasLoaded
    │   ├── useWorkoutStore.ts   # Zustand: workouts, workoutLog, calcStreak()
    │   ├── useNutritionStore.ts # Zustand: foodLog, waterToday, customFoods
    │   ├── useMeasurementsStore.ts # Zustand: measurements
    │   └── useThemeStore.ts     # Zustand: themeId, persist
    ├── hooks/
    │   └── useTheme.ts          # Returnerar aktiva temavärden
    └── lib/
        ├── storage.ts           # AsyncStorage wrapper + STORAGE_KEYS
        └── macroCalc.ts         # calcTDEE(), calcMacros(), PACE_LABELS
```

---

## Roadmap

| Fas | Innehåll | Status |
|---|---|---|
| **Fas 1** | Splash, Onboarding, Dashboard, Schema, Aktiv träning, Bibliotek | ✅ Klar |
| **Fas 2** | Progressionsgraf, Achievements/streaks, Utbyggt bibliotek (75 övningar) | ✅ Klar |
| **Fas 3** | Kostlogg, Makrospårning, Matdatabas, Vattenlogg, Egna livsmedel | ✅ Klar |
| **Fas 4** | Profil-redigering, Viktgraf, Mätningar, Egna livsmedel | ✅ Klar |
| **Fas 5** | React Native + Expo migration, AsyncStorage, offline-stöd | ✅ Klar |
| **Fas 6** | Barcodeläsare, Open Food Facts API, Push-notifikationer | 🔜 |

### Närmast kvar
- [ ] Barcodeläsare (Expo Camera) — ersätter sökning med skanning
- [ ] Open Food Facts API-integration
- [ ] Push-notifikationer (pass-påminnelse, vattenintag, invägningsdag)
- [ ] Progressionsgraf per övning i RN
- [ ] Export av all data till JSON

---

## Tech stack

| Komponent | Val |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router v6 (file-based) |
| State | Zustand |
| Persistens | `@react-native-async-storage/async-storage` |
| Charts | react-native-svg (hand-byggda SVG-grafer) |
| Animationer | React Native Animated API |
| Icons | lucide-react-native |
| Barcode | — (ej implementerat, kräver Expo Camera) |
| Notiser | — (ej implementerat, kräver Expo Notifications) |

### Kaloriformel

TDEE beräknas med **Mifflin-St Jeor**:

```
Män:     BMR = 10×vikt + 6.25×längd − 5×ålder + 5
Kvinnor: BMR = 10×vikt + 6.25×längd − 5×ålder − 161

TDEE = BMR × aktivitetsmultiplikator
  sedentary:   × 1.2
  light:       × 1.375
  moderate:    × 1.55
  very_active: × 1.725

Takt-justering:
  lose:
    slow:     TDEE − 250 kcal  (~0,25 kg/vecka)
    moderate: TDEE − 500 kcal  (~0,5 kg/vecka)
    fast:     TDEE − 750 kcal  (~0,75 kg/vecka)
  gain:
    slow:     TDEE + 200 kcal  (lean bulk, ~0,2 kg/vecka)
    moderate: TDEE + 350 kcal  (~0,35 kg/vecka)
    fast:     TDEE + 500 kcal  (~0,5 kg/vecka)
  maintain:   TDEE (ingen justering)

Minimum: 1 200 kcal/dag
```

---

*Senast uppdaterad: 2026-05-01*
