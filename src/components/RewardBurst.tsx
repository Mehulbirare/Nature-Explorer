/**
 * RewardBurst — the celebration bundle: confetti + chime + success haptic.
 * Bump `fireKey` (e.g. set it to found count) to fire a fresh burst.
 * Set `big` for the win-screen cannon.
 */
import React, {useEffect} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {colors} from '../theme';
import {successBuzz} from '../services/haptics';
import {playChime, playFanfare} from '../services/sound';

const {width: W} = Dimensions.get('window');

const CONFETTI_COLORS = [
  colors.sunny,
  colors.coral,
  colors.sky,
  colors.primaryLight,
  colors.white,
];

type Props = {
  fireKey: number;
  big?: boolean;
};

export function RewardBurst({fireKey, big = false}: Props) {
  useEffect(() => {
    if (fireKey <= 0) {
      return;
    }
    successBuzz();
    if (big) {
      playFanfare();
    } else {
      playChime();
    }
  }, [fireKey, big]);

  if (fireKey <= 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ConfettiCannon
        // Remount on every fire so the cannon replays.
        key={fireKey}
        count={big ? 180 : 70}
        origin={{x: W / 2, y: big ? -20 : 120}}
        explosionSpeed={big ? 420 : 350}
        fallSpeed={big ? 3200 : 2600}
        fadeOut
        colors={CONFETTI_COLORS}
      />
    </View>
  );
}
