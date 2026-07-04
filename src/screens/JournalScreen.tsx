/**
 * Screen — Hunt Journal (per activity).
 * Opened when a hunt is picked. Shows today's task (start it, or a "done for today"
 * badge once the daily goal is met) and a scrollable list of past days. Tapping a
 * day opens that day's photos. The daily task resets automatically at midnight
 * because new captures fall under a new date key.
 */
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Image} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {BackButton} from '../components/BackButton';
import {PillButton} from '../components/PillButton';
import {PressableScale} from '../components/PressableScale';
import {getHunt} from '../config/themes';
import {DayGroup, currentStreak, journalDays, todayKey} from '../services/gallery';
import {colors, fonts, fontSizes, radius, shadow} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

export function JournalScreen({navigation, route}: Props) {
  const theme = getHunt(route.params?.huntId);
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload every time the screen comes back into focus (e.g. after a hunt).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      journalDays(theme.id).then(d => {
        if (alive) {
          setDays(d);
          setLoading(false);
        }
      });
      return () => {
        alive = false;
      };
    }, [theme.id]),
  );

  const today = days.find(d => d.dateKey === todayKey());
  const todayCount = today?.shots.length ?? 0;
  const doneToday = todayCount >= theme.goal;
  const pastDays = days.filter(d => d.dateKey !== todayKey());
  const streak = currentStreak(days, theme.goal);

  return (
    <Background variant="welcome" overlay={0.5}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28},
        ]}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
          <Text style={styles.emoji}>{theme.emoji}</Text>
          <Text style={styles.title}>{theme.title}</Text>
          <Text style={styles.subtitle}>Find {theme.goal} every day</Text>
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>
                🔥 {streak} day{streak === 1 ? '' : 's'} in a row!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Today's task */}
        <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today</Text>
          {doneToday ? (
            <>
              <Text style={styles.doneBig}>🎉 All done!</Text>
              <Text style={styles.doneSub}>
                You found {theme.goal} {theme.targetLabel}s today.{'\n'}Come back tomorrow!
              </Text>
              <View style={{height: 12}} />
              <PillButton
                label="See today's photos 📸"
                size="md"
                color={theme.color}
                textColor={colors.white}
                onPress={() =>
                  navigation.navigate('Day', {huntId: theme.id, dateKey: todayKey()})
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.progress}>
                {todayCount} / {theme.goal}
              </Text>
              <Text style={styles.progressSub}>
                {todayCount === 0
                  ? "Let's find your first one!"
                  : `${theme.goal - todayCount} to go!`}
              </Text>
              <View style={{height: 14}} />
              <PillButton
                label={todayCount === 0 ? 'Start the Hunt! 🔍' : 'Keep going! 🔍'}
                color={colors.sunny}
                textColor={colors.primaryDark}
                glow
                onPress={() => navigation.navigate('Hunt', {huntId: theme.id})}
              />
              {todayCount > 0 && (
                <>
                  <View style={{height: 12}} />
                  <PillButton
                    label="See today's photos 📸"
                    size="md"
                    color={theme.color}
                    textColor={colors.white}
                    onPress={() =>
                      navigation.navigate('Day', {
                        huntId: theme.id,
                        dateKey: todayKey(),
                      })
                    }
                  />
                </>
              )}
            </>
          )}
        </Animated.View>

        {/* Past days */}
        <Text style={styles.sectionTitle}>Past days</Text>
        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : pastDays.length === 0 ? (
          <Text style={styles.empty}>No past hunts yet — today is day one! 🌱</Text>
        ) : (
          pastDays.map((day, i) => (
            <Animated.View
              key={day.dateKey}
              entering={FadeInUp.delay(80 + i * 60).duration(400)}>
              <DayRow
                day={day}
                goal={theme.goal}
                onPress={() =>
                  navigation.navigate('Day', {huntId: theme.id, dateKey: day.dateKey})
                }
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
      <BackButton />
    </Background>
  );
}

function DayRow({
  day,
  goal,
  onPress,
}: {
  day: DayGroup;
  goal: number;
  onPress: () => void;
}) {
  const complete = day.shots.length >= goal;
  return (
    <PressableScale onPress={onPress}>
      <View style={styles.row}>
        <Image source={{uri: day.shots[0]?.uri}} style={styles.thumb} />
        <View style={styles.rowText}>
          <Text style={styles.rowDate}>{day.label}</Text>
          <Text style={styles.rowCount}>
            {day.shots.length} photo{day.shots.length === 1 ? '' : 's'}
            {complete ? '  ✓' : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20},
  header: {alignItems: 'center', marginBottom: 18},
  emoji: {fontSize: 56},
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
  streakPill: {
    marginTop: 10,
    backgroundColor: colors.sunny,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
    ...shadow.soft,
  },
  streakText: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.body,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  todayCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
    ...shadow.lift,
  },
  todayLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.primary,
    marginBottom: 4,
  },
  progress: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.hero,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  progressSub: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.ink,
    opacity: 0.7,
  },
  doneBig: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.heading,
    fontWeight: '900',
    color: colors.primary,
  },
  doneSub: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },

  sectionTitle: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.heading,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12,
  },
  empty: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.85,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 12,
    ...shadow.soft,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  rowText: {flex: 1, marginLeft: 14},
  rowDate: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.body,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  rowCount: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 2,
  },
  chevron: {
    fontFamily: fonts.heavy,
    fontSize: 34,
    color: colors.primaryLight,
    marginRight: 6,
  },
});
