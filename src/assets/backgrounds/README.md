# Backgrounds

Drop 4K nature images here (all free for commercial use from https://pexels.com):

- `welcome.jpg` — search **"green leaves nature background"** / **"soft bokeh forest"**
- `win.jpg` — search **"sunny meadow flowers"** / **"colorful confetti background"**

Then wire them up in the screens, e.g. in `src/screens/WelcomeScreen.tsx`:

```ts
const welcomeBg = require('../assets/backgrounds/welcome.jpg');
// ...
<Background variant="welcome" image={welcomeBg} />
```

Without images the `Background` component still renders a premium animated Skia
gradient with drifting floaters, so the app looks great offline out of the box.
