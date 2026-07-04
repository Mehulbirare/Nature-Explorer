/**
 * Thin, crash-proof wrapper over react-native-haptic-feedback.
 * A physical buzz on every correct find and button tap.
 */
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

function trigger(type: string) {
  try {
    ReactNativeHapticFeedback.trigger(type as never, options);
  } catch {
    // Some emulators have no vibrator — never let a missing buzz break the flow.
  }
}

/** Light tick for button presses. */
export const tapBuzz = () => trigger('impactLight');

/** Satisfying double-thump on a correct find. */
export const successBuzz = () => trigger('notificationSuccess');

/** Soft, non-punishing nudge on "try again". */
export const softBuzz = () => trigger('impactMedium');
