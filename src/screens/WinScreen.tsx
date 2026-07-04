/**
 * Screen C — Win / Celebration.
 * Full confetti cannon, a big Lottie trophy, cheering mascot, fanfare,
 * and two giant buttons: Play Again and Home.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp, ZoomIn} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {PillButton} from '../components/PillButton';
import {RewardBurst} from '../components/RewardBurst';
import {LottieSafe} from '../components/LottieSafe';
import {colors, fonts, fontSizes} from '../theme';
import trophy from '../assets/lottie/trophy.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Win'>;

export function WinScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const huntId = route.params?.huntId;

  return (
    <Background variant="win" overlay={0.3}>
      {/* Big celebratory cannon (fires once on mount) */}
      <RewardBurst fireKey={1} big />

      <View
        style={[
          styles.container,
          {paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40},
        ]}>
        <Animated.View entering={ZoomIn.delay(150).duration(650)} style={styles.trophyWrap}>
          <LottieSafe source={trophy} fallbackEmoji="🏆" size={240} loop={false} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.textWrap}>
          <Text style={styles.title}>Today's hunt done! 🏆</Text>
          <Text style={styles.subtitle}>Come back tomorrow for more!</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(520).duration(600)} style={styles.buttons}>
          <PillButton
            label="See My Photos 📸"
            color={colors.primary}
            textColor={colors.white}
            glow
            onPress={() =>
              navigation.replace('Journal', {huntId: huntId ?? 'flowers'})
            }
          />
          <View style={{height: 16}} />
          <PillButton
            label="Pick a Hunt 🗺️"
            size="md"
            color={colors.sunny}
            textColor={colors.primaryDark}
            onPress={() => navigation.navigate('Pick')}
          />
          <View style={{height: 16}} />
          <PillButton
            label="Home 🏠"
            size="md"
            color={colors.white}
            textColor={colors.primaryDark}
            onPress={() => navigation.navigate('Welcome')}
          />
        </Animated.View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  trophyWrap: {alignItems: 'center', justifyContent: 'center', marginTop: 20},
  textWrap: {alignItems: 'center'},
  title: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.title,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 3},
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.heading,
    color: colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {width: '100%', alignItems: 'center'},
});
