/**
 * Screen — Trophy Shelf.
 * A grid of every sticker/badge. Earned ones are bright and colorful; locked ones
 * are greyed with a 🔒 and a hint of how to earn them. All state is derived from
 * the photos on disk, so it stays correct with no bookkeeping.
 */
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {BackButton} from '../components/BackButton';
import {PillButton} from '../components/PillButton';
import {Badge, computeBadges} from '../services/badges';
import {colors, fonts, fontSizes, radius, shadow} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Trophies'>;

export function TrophyScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      computeBadges().then(b => {
        if (alive) {
          setBadges(b);
          setLoading(false);
        }
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const earned = badges.filter(b => b.earned).length;

  return (
    <Background variant="win" overlay={0.4}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28},
        ]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <Text style={styles.title}>🏆 Trophy Shelf</Text>
          {!loading && (
            <Text style={styles.subtitle}>
              {earned} / {badges.length} earned
            </Text>
          )}
        </Animated.View>

        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : (
          <View style={styles.grid}>
            {badges.map((b, i) => (
              <Animated.View
                key={b.id}
                entering={FadeInUp.delay(60 + i * 45).duration(400)}
                style={styles.cardWrap}>
                <BadgeCard badge={b} />
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{height: 22}} />
        <PillButton
          label="Back 🏠"
          size="md"
          color={colors.white}
          textColor={colors.primaryDark}
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
      <BackButton />
    </Background>
  );
}

function BadgeCard({badge}: {badge: Badge}) {
  const {earned} = badge;
  return (
    <View style={[styles.card, earned ? styles.cardEarned : styles.cardLocked]}>
      <Text style={[styles.badgeEmoji, !earned && styles.lockedEmoji]}>
        {earned ? badge.emoji : '🔒'}
      </Text>
      <Text
        style={[styles.badgeTitle, !earned && styles.lockedText]}
        numberOfLines={1}>
        {badge.title}
      </Text>
      <Text
        style={[styles.badgeDesc, !earned && styles.lockedText]}
        numberOfLines={2}>
        {badge.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 16},
  header: {alignItems: 'center', marginBottom: 16, paddingHorizontal: 8},
  title: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.title,
    fontWeight: '900',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.95,
    marginTop: 4,
  },
  empty: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    textAlign: 'center',
    marginTop: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardWrap: {width: '33.33%', padding: 6},
  card: {
    borderRadius: radius.card,
    aspectRatio: 0.82,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  cardEarned: {backgroundColor: colors.white, ...shadow.lift},
  cardLocked: {backgroundColor: 'rgba(255,255,255,0.22)'},
  badgeEmoji: {fontSize: 40, marginBottom: 6},
  lockedEmoji: {opacity: 0.85},
  badgeTitle: {
    fontFamily: fonts.heavy,
    fontSize: 15,
    fontWeight: '900',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  badgeDesc: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.65,
    textAlign: 'center',
    marginTop: 2,
  },
  lockedText: {color: colors.white, opacity: 0.9},
});
