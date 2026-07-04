/**
 * ProgressStars — a row of goal stars that fill one by one.
 * Each fill = a spring scale-up with overshoot + a color pop from grey to gold.
 */
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {colors, springs} from '../theme';

function Star({filled, index}: {filled: boolean; index: number}) {
  const scale = useSharedValue(1);
  const pop = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    if (filled && pop.value === 0) {
      // Overshoot then settle, staggered slightly by index for a ripple feel.
      scale.value = withSequence(
        withTiming(0.6, {duration: 60}),
        withSpring(1.35, springs.pop),
        withSpring(1, springs.gentle),
      );
      pop.value = withTiming(1, {duration: 260});
    }
  }, [filled, scale, pop]);

  const style = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.Text
      style={[
        styles.star,
        {color: filled ? colors.starFilled : colors.starEmpty},
        style,
      ]}>
      {filled ? '⭐' : '☆'}
    </Animated.Text>
  );
}

export function ProgressStars({found, goal}: {found: number; goal: number}) {
  return (
    <View style={styles.row}>
      {Array.from({length: goal}).map((_, i) => (
        <Star key={i} index={i} filled={i < found} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  star: {
    fontSize: 40,
    marginHorizontal: 3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 3,
  },
});
