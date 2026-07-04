# iOS

This folder holds the hand-written iOS **source + config** for the app:

- `NatureExplorer/AppDelegate.h` / `.mm` — RN app entry (module name `NatureExplorer`)
- `NatureExplorer/main.m`
- `NatureExplorer/Info.plist` — includes **`NSCameraUsageDescription`** (required for vision-camera)
- `NatureExplorer/LaunchScreen.storyboard`, `Images.xcassets/`
- `Podfile` — CocoaPods dependencies (autolinks all native modules)

## Not included (generated, and binary/host-specific)

The Xcode project itself — `NatureExplorer.xcodeproj/` and, after pods, the
`.xcworkspace` — is **generated**, not hand-written. Create it on a Mac by
scaffolding a matching RN 0.86 template and dropping these files in, or by
running `npx @react-native-community/cli init` once and copying its `ios/*.xcodeproj`.

## Build (requires macOS + Xcode)

```bash
cd ios
pod install          # some libs (Skia) may need: USE_FRAMEWORKS=static pod install
cd ..
npx react-native run-ios
```

> iOS **cannot be built on Windows**. The required Sprout deliverable is an
> Android APK — iOS here is for cross-platform completeness only.
