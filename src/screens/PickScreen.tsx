/**
 * Screen A½ — Pick an Activity.
 * A friendly grid of big, tappable hunt cards. Each card springs on press and
 * launches its own hunt. Adding an entry to HUNTS (config/themes) adds a card here
 * automatically — no changes needed in this file.
 */
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {PressableScale} from '../components/PressableScale';
import {HUNTS, HuntTheme} from '../config/themes';
import {colors, fonts, fontSizes, radius, shadow} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Pick'>;

export function PickScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Background variant="welcome" overlay={0.45}>
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, {paddingTop: insets.top + 20}]}>
        <Text style={styles.title}>Pick a Hunt!</Text>
        <Text style={styles.subtitle}>What should we find today?</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.grid, {paddingBottom: insets.bottom + 28}]}
        showsVerticalScrollIndicator={false}>
        {HUNTS.map((hunt, i) => (
          <Animated.View
            key={hunt.id}
            entering={FadeInUp.delay(120 + i * 70).duration(500)}
            style={styles.cardWrap}>
            <HuntCard
              hunt={hunt}
              onPress={() => navigation.navigate('Journal', {huntId: hunt.id})}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </Background>
  );
}

function HuntCard({hunt, onPress}: {hunt: HuntTheme; onPress: () => void}) {
  return (
    <PressableScale onPress={onPress}>
      <View style={[styles.card, {backgroundColor: hunt.color}]}>
        <Text style={styles.cardEmoji}>{hunt.emoji}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {hunt.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          Find {hunt.goal}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: {alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8},
  title: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.hero,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 8,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.95,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardWrap: {width: '50%', padding: 8},
  card: {
    borderRadius: radius.card,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    ...shadow.lift,
  },
  cardEmoji: {fontSize: 60, marginBottom: 8},
  cardTitle: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.heading,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
  },
  cardSub: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
});
