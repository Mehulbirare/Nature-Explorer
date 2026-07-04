# Fonts

Bundle one rounded, chunky, friendly family here. Recommended: **Fredoka**
(https://fonts.google.com/specimen/Fredoka) or **Baloo 2**.

Place these exact filenames so they match `src/theme.ts`:

- `Fredoka-Regular.ttf`
- `Fredoka-Medium.ttf`
- `Fredoka-SemiBold.ttf`

Then link them into the native projects:

```bash
npx react-native-asset
```

If the font family isn't installed, the UI falls back to the platform's default
rounded system font — everything still renders, just less custom.
