/**
 * BackButton — a big, kid-friendly circular back control pinned to the top-left,
 * safe-area aware. Sits above screen content. Hides itself automatically when
 * there's nowhere to go back to (e.g. the root screen).
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PressableScale} from './PressableScale';
import {colors, fonts} from '../theme';

type Props = {
  /** Custom handler; defaults to navigation.goBack(). */
  onPress?: () => void;
};

export function BackButton({onPress}: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  if (!onPress && !navigation.canGoBack()) {
    return null;
  }

  return (
    <View style={[styles.wrap, {top: insets.top + 6}]} pointerEvents="box-none">
      <PressableScale onPress={onPress ?? (() => navigation.goBack())}>
        {/* Generous hit area, but no background shape — just the arrow. */}
        <View style={styles.hit}>
          <Text style={styles.arrow}>‹</Text>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute', left: 8, zIndex: 20},
  hit: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontFamily: fonts.heavy,
    fontSize: 52,
    lineHeight: 56,
    color: colors.white,
    // Drop shadow so the bare arrow stays legible over any background.
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 6,
  },
});
