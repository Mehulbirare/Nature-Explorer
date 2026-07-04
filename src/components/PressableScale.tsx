/**
 * PressableScale — the spring-on-press wrapper used on EVERY tappable element.
 * Scales to 0.94 with a spring on press-in, back to 1 on release. No dead taps.
 * Fires a light haptic tick automatically unless disabled.
 */
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {springs} from '../theme';
import {tapBuzz} from '../services/haptics';

type Props = {
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** How far to squish. 0.94 default. */
  activeScale?: number;
};

export function PressableScale({
  onPress,
  disabled = false,
  haptic = true,
  style,
  children,
  activeScale = 0.94,
}: Props) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .maxDuration(10000)
    // Run callbacks on the JS thread so we can call haptics / onPress directly.
    .runOnJS(true)
    .onBegin(() => {
      scale.value = withSpring(activeScale, springs.press);
    })
    .onFinalize((_e, success) => {
      scale.value = withSpring(1, springs.pop);
      if (success && !disabled) {
        if (haptic) {
          tapBuzz();
        }
        onPress?.();
      }
    })
    .enabled(!disabled);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}
