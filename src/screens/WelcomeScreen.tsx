/**
 * Screen A — Welcome / Start.
 * Full-bleed nature background (Ken Burns), a bouncing Lottie mascot,
 * a huge title, and one giant glowing "Start the Hunt!" pill.
 * Entrances stagger in: title drops, mascot pops, button rises.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {FadeInDown, FadeInUp, ZoomIn} from 'react-native-reanimated';

import {RootStackParamList} from '../navigation';
import {Background} from '../components/Background';
import {PillButton} from '../components/PillButton';
import {LottieSafe} from '../components/LottieSafe';
import {colors, fonts, fontSizes} from '../theme';
// Optional: drop a 4K image into src/assets/backgrounds/ and uncomment.
// const welcomeBg = require('../assets/backgrounds/welcome.jpg');
import mascot from '../assets/lottie/mascot.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Background variant="welcome" overlay={0.4} /* image={welcomeBg} */>
      <View
        style={[
          styles.container,
          {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40},
        ]}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.kicker}>🌿  Let's explore  🌿</Text>
          <Text style={styles.title}>Nature{'\n'}Explorer</Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(200).duration(600)} style={styles.mascotWrap}>
          <LottieSafe source={mascot} fallbackEmoji="🌱" size={220} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(360).duration(600)}>
          <PillButton
            label="Start the Hunt! 🌸"
            color={colors.sunny}
            textColor={colors.primaryDark}
            glow
            onPress={() => navigation.navigate('Pick')}
          />
          <View style={{height: 16}} />
          <PillButton
            label="My Trophies 🏆"
            size="md"
            color={colors.white}
            textColor={colors.primaryDark}
            onPress={() => navigation.navigate('Trophies')}
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
  header: {alignItems: 'center'},
  kicker: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.95,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.hero,
    lineHeight: fontSizes.hero + 4,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 8,
  },
  mascotWrap: {alignItems: 'center', justifyContent: 'center'},
});
