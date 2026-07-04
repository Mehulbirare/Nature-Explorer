/**
 * PillButton — oversized (min 72px), pill-shaped, soft-shadowed button with a
 * pulsing glow option. One clear label + emoji. Springs on press via PressableScale.
 */
import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {PressableScale} from './PressableScale';
import {colors, fonts, radius, shadow} from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  glow?: boolean;
  size?: 'lg' | 'md';
};

export function PillButton({
  label,
  onPress,
  color = colors.sunny,
  textColor = colors.ink,
  glow = false,
  size = 'lg',
}: Props) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (glow) {
      pulse.value = withRepeat(
        withTiming(1, {duration: 1100, easing: Easing.inOut(Easing.ease)}),
        -1,
        true,
      );
    }
  }, [glow, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.4,
    transform: [{scale: 1 + pulse.value * 0.08}],
  }));

  const heightStyle = size === 'lg' ? styles.lg : styles.md;

  return (
    <View style={styles.wrap}>
      {glow ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, heightStyle, {backgroundColor: color}, glowStyle]}
        />
      ) : null}
      <PressableScale onPress={onPress}>
        <View style={[styles.button, heightStyle, {backgroundColor: color}]}>
          <Text style={[styles.label, {color: textColor}]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  glow: {
    position: 'absolute',
    width: '100%',
    borderRadius: radius.pill,
  },
  button: {
    minWidth: 260,
    borderRadius: radius.pill,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lift,
  },
  lg: {height: 84},
  md: {height: 72},
  label: {
    fontFamily: fonts.heavy,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
