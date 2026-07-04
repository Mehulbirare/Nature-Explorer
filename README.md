# 🌸 Nature Explorer

A camera treasure-hunt learning game for kids (ages 3–8), built with **React Native 0.86 CLI (bare) + TypeScript** (New Architecture).

A child gets a mission — _"Find 5 flowers 🌸"_ — walks around pointing the **real camera** at objects, and every correct find fires a **juicy reward**: confetti + chime + haptic buzz + a filling star + a bouncing mascot, ending in a celebratory win screen. Buttery, playful, premium — a mini Duolingo-for-toddlers moment.

---

## ✨ What's inside

| Area | Implementation |
|---|---|
| Camera | `react-native-vision-camera` v4 (full-screen live preview + `takePhoto`) |
| Recognition | Google Cloud Vision **LABEL_DETECTION** → keyword match against the active theme |
| Motion | `react-native-reanimated` v4 + `react-native-worklets` (springs, layout animations) + `moti` |
| Gestures | `react-native-gesture-handler` — every tappable springs to 0.94 on press |
| Premium visuals | `@shopify/react-native-skia` — animated gradient background + pulsing glow ring |
| Vector art | `lottie-react-native` — bouncing mascot, star burst, win trophy (JSON included) |
| Celebration | `react-native-confetti-cannon` + `react-native-haptic-feedback` + `react-native-sound` |
| Navigation | `@react-navigation/native-stack` with fade / slide transitions (never a hard cut) |

**No dead ends by design:** if Vision misses (or no API key is set), the always-present **"✅ I found it!"** button keeps the flow moving, and a miss shows a gentle _"Hmm, try again! 🔍"_ — never a red error.

**Works offline out of the box:** the animated Skia gradient background, hand-authored Lottie animations, confetti, haptics and springs all run with **zero bundled binary assets**. Backgrounds, fonts and sounds are optional drop-ins that upgrade the polish (see below).

---

## 📋 Prerequisites

- Node.js ≥ 18, JDK 17
- Android Studio + Android SDK (Platform 36, Build-Tools 36), an emulator or a **real Android device** (recommended — this is a camera app)
- React Native environment set up: https://reactnative.dev/docs/set-up-your-environment

---

## 🚀 Setup

```bash
cd "Nature Explorer"
npm install
```

Two small **binary artifacts** can't be shipped in source and are generated once:

**1. Gradle wrapper** (regenerates `gradlew`, `gradlew.bat` and the wrapper jar):
```bash
cd android
gradle wrapper --gradle-version 8.14.3
cd ..
```
> No system Gradle? Alternatively copy the `android/gradle/wrapper/gradle-wrapper.jar`, `gradlew` and `gradlew.bat` from any React Native 0.86 project.

**2. Debug keystore** (used to sign both debug and the demo release APK):
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android \
  -dname "CN=Android Debug,O=Android,C=US"
```

**3. (Optional) Google Vision API key** — for real recognition:
- Enable *Cloud Vision API* in a Google Cloud project, create an API key.
- Paste it into [`src/services/vision.ts`](src/services/vision.ts) → `VISION_API_KEY`.
- Free tier = 1,000 label units/month. Without a key, the capture button stays generous so the demo never stalls.

---

## ▶️ Run

```bash
npm start                 # Metro (keep running)
npm run android           # build + install on device/emulator
```

**iOS** (optional, macOS only — the required deliverable is an Android APK):
```bash
cd ios && pod install && cd ..
npm run ios
```
See [ios/README.md](ios/README.md) — the `.xcodeproj` is generated on a Mac; iOS cannot be built on Windows.

## 📦 Build the APK

```bash
npm run apk:debug         # android/app/build/outputs/apk/debug/app-debug.apk
# or
npm run apk:release       # android/app/build/outputs/apk/release/app-release.apk
```

Install on a device:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎨 Optional asset drop-ins (extra polish)

| Asset | Where | Notes |
|---|---|---|
| 4K backgrounds | `src/assets/backgrounds/` | Free from [pexels.com](https://pexels.com). See the folder README, then pass `image={...}` to `<Background>`. |
| Rounded font | `src/assets/fonts/` | Fredoka / Baloo 2 `.ttf`, then `npx react-native-asset`. |
| Sound FX | `android/app/src/main/res/raw/` | `shutter.mp3`, `chime.mp3`, `fanfare.mp3`, `nudge.mp3`. |

Everything degrades gracefully — a missing asset never breaks the build or the flow.

---

## 🔀 Swap the hunt theme

Flip flowers → gadgets (or add your own) in one line — [`src/config/themes.ts`](src/config/themes.ts):

```ts
export const ACTIVE_THEME: HuntTheme = THEMES.devices; // was THEMES.flowers
```

Each theme defines its emoji, mission text, goal count and Vision keyword list.

---

## 🗂 Project structure

```
src/
  assets/
    backgrounds/   Pexels 4K images (optional drop-in)
    fonts/         Fredoka / Baloo2 .ttf (optional drop-in)
    lottie/        mascot.json · trophy.json · star-burst.json (included)
  components/
    PressableScale.tsx      spring-on-press wrapper — used everywhere
    GlowingCaptureButton.tsx Skia pulsing capture ring
    ProgressStars.tsx        stars that fill with an overshoot pop
    RewardBurst.tsx          confetti + chime + haptic bundle
    Background.tsx           Skia gradient + Ken Burns + drifting floaters
    PillButton.tsx           oversized glowing pill button
    LottieSafe.tsx           Lottie with emoji fallback (bulletproof)
  screens/
    WelcomeScreen.tsx        Screen A — start
    HuntScreen.tsx           Screen B — camera + core reward loop (the heart)
    WinScreen.tsx            Screen C — celebration
  services/
    vision.ts                Google Vision call + base64 read
    sound.ts                 react-native-sound wrapper (no-ops if missing)
    haptics.ts               haptic buzzes
  config/
    themes.ts                flowers / devices keyword sets
  theme.ts                   design tokens (colors, spacing, springs)
  navigation.ts              stack param types
  App.tsx                    NavigationContainer + native stack
```

---

## 🎬 Demo tips (where the points are)

- Film on a **real phone in good light**, walking around snapping **real objects**.
- Show: camera opening → a live find + reward → the win screen.
- Reward lands within ~1s of every correct tap; wrong photo = gentle "try again," never an error.

---

## 🛠 Troubleshooting

- **`gradle-wrapper.jar` missing / `gradlew` not found** → run the `gradle wrapper` step above.
- **Signing error on build** → generate the `debug.keystore` (step 2).
- **Camera is black on emulator** → use a real device, or the app shows a friendly placeholder and the "✅ I found it!" button still works.
- **Reanimated error at startup** → with Reanimated 4 the Babel plugin is `react-native-worklets/plugin` and it must be the **last** entry in `babel.config.js`; confirm `react-native-worklets` is installed, then `npm start --reset-cache`.
