/**
 * Background — a premium, always-alive backdrop.
 *
 * Layers, bottom to top:
 *   1. Skia animated gradient (no asset required, works offline).
 *   2. Optional bundled Pexels image with a slow Ken Burns drift.
 *   3. A dark-to-transparent gradient overlay for text legibility.
 *   4. A few softly drifting emoji "petals" for life.
 *
 * Drop 4K images into src/assets/backgrounds/ and pass them via the `image` prop
 * (see screens). Without an image, the Skia gradient alone still looks great.
 */
import React, {useEffect} from 'react';
import {
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Canvas, Rect, LinearGradient as SkiaGradient, vec} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../theme';

const {width: W, height: H} = Dimensions.get('window');

type Variant = 'welcome' | 'hunt' | 'win';

const PALETTES: Record<Variant, string[]> = {
  welcome: ['#66BB6A', '#2E7D32', '#1B5E20'],
  hunt: ['#A5D6A7', '#C8E6C9', '#E8F5E9'],
  win: ['#FFD966', '#FFC93C', '#FF8A5B'],
};

const FLOATERS: Record<Variant, string[]> = {
  welcome: ['🌿', '🍃', '🌸', '🦋'],
  hunt: ['🍃', '🌱'],
  win: ['🎉', '⭐', '🌟', '✨', '🏆'],
};

function Floater({emoji, index}: {emoji: string; index: number}) {
  const y = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(
      withTiming(1, {duration: 6000 + index * 900, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    drift.value = withRepeat(
      withTiming(1, {duration: 4200 + index * 700, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [y, drift, index]);

  const left = ((index * 137) % 90) + 4; // spread across the width, %
  const top = ((index * 91) % 70) + 8;

  const style = useAnimatedStyle(() => ({
    transform: [
      {translateY: -18 + y.value * 36},
      {translateX: -12 + drift.value * 24},
      {rotate: `${-10 + drift.value * 20}deg`},
    ],
    opacity: 0.5 + y.value * 0.4,
  }));

  return (
    <Animated.Text
      style={[
        {position: 'absolute', left: `${left}%`, top: `${top}%`, fontSize: 30},
        style,
      ]}>
      {emoji}
    </Animated.Text>
  );
}

type Props = {
  variant?: Variant;
  image?: ImageSourcePropType;
  children?: React.ReactNode;
  /** Strength of the dark overlay (0 = none). */
  overlay?: number;
};

export function Background({
  variant = 'welcome',
  image,
  children,
  overlay = 0.35,
}: Props) {
  // Ken Burns drift for the optional image.
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, {duration: 12000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [scale]);
  const kenBurns = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const palette = PALETTES[variant];

  return (
    <View style={styles.fill}>
      {/* 1. Skia gradient base */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={W} height={H}>
          <SkiaGradient
            start={vec(0, 0)}
            end={vec(W, H)}
            colors={palette}
          />
        </Rect>
      </Canvas>

      {/* 2. Optional bundled image with Ken Burns */}
      {image ? (
        <Animated.View style={[StyleSheet.absoluteFill, kenBurns]}>
          <ImageBackground source={image} style={styles.fill} resizeMode="cover" />
        </Animated.View>
      ) : null}

      {/* 3. Legibility overlay */}
      <LinearGradient
        colors={[
          `rgba(12,40,12,${overlay * 0.2})`,
          `rgba(12,40,12,${overlay})`,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* 4. Drifting floaters */}
      {FLOATERS[variant].map((e, i) => (
        <Floater key={`${e}-${i}`} emoji={e} index={i} />
      ))}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1, width: '100%', height: '100%'},
});

export {colors};
