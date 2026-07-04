/**
 * GlowingCaptureButton — the big pulsing capture ring the child taps.
 * A continuous Skia glow loop tells kids exactly where to press. Springs on tap.
 * Pass `shake` to run a gentle "try again" wobble (never a red error state).
 */
import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, Circle, Group} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {PressableScale} from './PressableScale';
import {colors} from '../theme';

const SIZE = 168;
const CENTER = SIZE / 2;

type Props = {
  onCapture: () => void;
  busy?: boolean;
  /** Increment this number to trigger a shake. */
  shakeKey?: number;
};

export function GlowingCaptureButton({onCapture, busy = false, shakeKey = 0}: Props) {
  // Continuous 0->1 pulse loop that drives the glow rings.
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {duration: 1400, easing: Easing.inOut(Easing.ease)}),
      -1,
      false,
    );
  }, [pulse]);

  const rOuter = useDerivedValue(() => 58 + pulse.value * 22);
  const rMid = useDerivedValue(() => 54 + pulse.value * 10);
  const outerOpacity = useDerivedValue(() => 0.5 * (1 - pulse.value));
  const midOpacity = useDerivedValue(() => 0.35 * (1 - pulse.value * 0.6));

  // "Try again" wobble.
  const shakeX = useSharedValue(0);
  useEffect(() => {
    if (shakeKey > 0) {
      shakeX.value = withSequence(
        withTiming(-10, {duration: 55}),
        withTiming(10, {duration: 55}),
        withTiming(-7, {duration: 55}),
        withTiming(7, {duration: 55}),
        withTiming(0, {duration: 55}),
      );
    }
  }, [shakeKey, shakeX]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shakeX.value}],
  }));

  return (
    <Animated.View style={[styles.wrap, containerStyle]}>
      <PressableScale onPress={onCapture} disabled={busy} activeScale={0.9}>
        <View style={styles.button}>
          {/* Skia glow rings */}
          <Canvas style={StyleSheet.absoluteFill}>
            <Group>
              <Circle cx={CENTER} cy={CENTER} r={rOuter} color={colors.white} opacity={outerOpacity} />
              <Circle cx={CENTER} cy={CENTER} r={rMid} color={colors.sunny} opacity={midOpacity} />
              <Circle cx={CENTER} cy={CENTER} r={52} color={colors.white} opacity={0.95} />
              <Circle cx={CENTER} cy={CENTER} r={46} color={colors.primary} />
            </Group>
          </Canvas>
          <Text style={styles.icon}>{busy ? '🔍' : '📷'}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  button: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {fontSize: 44},
});
