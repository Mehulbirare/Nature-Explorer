/**
 * Sound effects via react-native-sound.
 *
 * Drop these lowercase, space-free files into:
 *   android/app/src/main/res/raw/
 *     shutter.mp3   — camera shutter on capture
 *     chime.mp3     — happy reward chime on a correct find
 *     fanfare.mp3   — win-screen celebration
 *     nudge.mp3     — gentle "try again" blip (optional)
 *
 * Every call is wrapped so a missing file simply no-ops — the haptics,
 * confetti and animation still fire, so the demo never depends on audio.
 */
import Sound from 'react-native-sound';

Sound.setCategory('Ambient', true);

type Key = 'shutter' | 'chime' | 'fanfare' | 'nudge';

const FILES: Record<Key, string> = {
  shutter: 'shutter.mp3',
  chime: 'chime.mp3',
  fanfare: 'fanfare.mp3',
  nudge: 'nudge.mp3',
};

const cache: Partial<Record<Key, Sound>> = {};

function load(key: Key): Promise<Sound | null> {
  return new Promise(resolve => {
    if (cache[key]) {
      return resolve(cache[key]!);
    }
    const s = new Sound(FILES[key], Sound.MAIN_BUNDLE, error => {
      if (error) {
        return resolve(null); // file not bundled yet — silent no-op
      }
      cache[key] = s;
      resolve(s);
    });
  });
}

export async function play(key: Key, volume = 1) {
  try {
    const s = await load(key);
    if (!s) {
      return;
    }
    s.setVolume(volume);
    s.stop(() => s.play());
  } catch {
    // never let audio break the flow
  }
}

export const playShutter = () => play('shutter', 0.7);
export const playChime = () => play('chime');
export const playFanfare = () => play('fanfare');
export const playNudge = () => play('nudge', 0.6);
