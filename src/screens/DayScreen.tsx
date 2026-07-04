/**
 * Screen — One Day's Photos.
 * A grid of every picture the child captured for a hunt on a single calendar day.
 * Reached from the Journal list; back-swipe returns there.
 */
import React, {useCallback, useState} from 'react';
import {Dimensions, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {PillButton} from '../components/PillButton';
import {PressableScale} from '../components/PressableScale';
import {getHunt} from '../config/themes';
import {Shot, dateLabel, shotsForDay} from '../services/gallery';
import {colors, fonts, fontSizes, radius, shadow} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Day'>;

const GAP = 10;
const COLS = 3;
const TILE = (Dimensions.get('window').width - 40 - GAP * (COLS - 1)) / COLS;

export function DayScreen({navigation, route}: Props) {
  const {huntId, dateKey} = route.params;
  const theme = getHunt(huntId);
  const insets = useSafeAreaInsets();
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload on focus so a retake shows up the moment we return from the camera.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      shotsForDay(huntId, dateKey).then(s => {
        if (alive) {
          setShots(s);
          setLoading(false);
        }
      });
      return () => {
        alive = false;
      };
    }, [huntId, dateKey]),
  );

  return (
    <Background variant="welcome" overlay={0.5}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <Text style={styles.emoji}>{theme.emoji}</Text>
          <Text style={styles.title}>{dateLabel(dateKey)}</Text>
          <Text style={styles.subtitle}>
            {shots.length} {theme.targetLabel}
            {shots.length === 1 ? '' : 's'} found
          </Text>
        </Animated.View>

        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : shots.length === 0 ? (
          <Text style={styles.empty}>No photos this day.</Text>
        ) : (
          <View style={styles.grid}>
            {shots.map((s, i) => (
              <Animated.View
                key={s.path}
                entering={FadeInUp.delay(i * 50).duration(400)}
                style={styles.tileWrap}>
                <Image source={{uri: s.uri}} style={styles.tile} />
                <PressableScale
                  onPress={() =>
                    navigation.navigate('Hunt', {
                      huntId,
                      retakePath: s.path,
                      retakeDateKey: dateKey,
                    })
                  }>
                  <View style={styles.retakeBadge}>
                    <Text style={styles.retakeText}>🔄 Retake</Text>
                  </View>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{height: 20}} />
        <PillButton
          label="Back to journal 📖"
          size="md"
          color={colors.white}
          textColor={colors.primaryDark}
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20},
  header: {alignItems: 'center', marginBottom: 18},
  emoji: {fontSize: 52},
  title: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.title,
    fontWeight: '900',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: GAP},
  tileWrap: {...shadow.soft, alignItems: 'center'},
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.card - 8,
    backgroundColor: colors.primaryLight,
  },
  retakeBadge: {
    marginTop: 6,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retakeText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primaryDark,
  },
  empty: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 30,
  },
});
