/**
 * Screen B — The Hunt (camera + core reward loop). The heart of the app.
 *
 * Full-screen vision-camera preview, a mission bar with filling stars, a pulsing
 * capture ring, and a manual "✅ I found it!" fallback so a missed recognition
 * never freezes the flow. Every correct find fires within ~1s:
 * confetti + chime + haptic + star fill + mascot bounce + a zooming reward card.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {MotiView} from 'moti';

import {RootStackParamList} from '../navigation';
import {ProgressStars} from '../components/ProgressStars';
import {GlowingCaptureButton} from '../components/GlowingCaptureButton';
import {RewardBurst} from '../components/RewardBurst';
import {PillButton} from '../components/PillButton';
import {LottieSafe} from '../components/LottieSafe';
import {colors, fonts, fontSizes, radius, shadow} from '../theme';
import {getHunt, labelsMatch} from '../config/themes';
import {detectLabels, readPhotoBase64} from '../services/vision';
import {countPhotos, retakePhoto, savePhoto} from '../services/gallery';
import {playShutter, playNudge} from '../services/sound';
import {softBuzz} from '../services/haptics';
import starBurst from '../assets/lottie/star-burst.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Hunt'>;
type Status = 'idle' | 'checking' | 'correct' | 'retry';

export function HuntScreen({navigation, route}: Props) {
  const theme = getHunt(route.params?.huntId);
  // Retake mode: replace one existing photo instead of running the daily goal.
  const retakePath = route.params?.retakePath;
  const retakeDateKey = route.params?.retakeDateKey;
  const isRetake = !!retakePath && !!retakeDateKey;
  const insets = useSafeAreaInsets();
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  const [found, setFound] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [burstKey, setBurstKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [bounceKey, setBounceKey] = useState(0);

  const busy = status === 'checking';

  // Camera permission on mount.
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Resume today's progress: photos already taken today count toward the goal,
  // so the daily task picks up where it left off (and resets on a new day).
  // Skipped in retake mode — there we replace one shot, not chase the goal.
  useEffect(() => {
    if (isRetake) {
      return;
    }
    let alive = true;
    countPhotos(theme.id).then(n => {
      if (alive) {
        // Never clobber a find the child just made while this was loading.
        setFound(prev => (prev > 0 ? prev : Math.min(n, theme.goal)));
      }
    });
    return () => {
      alive = false;
    };
  }, [isRetake, theme.id, theme.goal]);

  // Shutter flash overlay.
  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({opacity: flash.value}));
  const fireFlash = useCallback(() => {
    flash.value = withSequence(
      withTiming(0.85, {duration: 60}),
      withTiming(0, {duration: 220}),
    );
  }, [flash]);

  // Win when the last star fills (never in retake mode).
  useEffect(() => {
    if (!isRetake && found >= theme.goal) {
      const t = setTimeout(() => navigation.replace('Win', {huntId: theme.id}), 1200);
      return () => clearTimeout(t);
    }
  }, [isRetake, found, navigation, theme]);

  const registerFind = useCallback(() => {
    setFound(prev => Math.min(prev + 1, theme.goal));
    setBurstKey(k => k + 1);
    setBounceKey(k => k + 1);
    setStatus('correct');
    // Reward card lingers ~1.1s then we return to idle.
    setTimeout(() => {
      setStatus(s => (s === 'correct' ? 'idle' : s));
    }, 1100);
  }, []);

  const gentleRetry = useCallback(() => {
    setStatus('retry');
    setShakeKey(k => k + 1);
    softBuzz();
    playNudge();
    setTimeout(() => setStatus(s => (s === 'retry' ? 'idle' : s)), 900);
  }, []);

  const handleCapture = useCallback(async () => {
    if (busy || found >= theme.goal) {
      return;
    }
    setStatus('checking');
    playShutter();
    fireFlash();

    let matched: boolean;
    let capturedPath: string | null = null;
    try {
      if (camera.current && device) {
        const photo = await camera.current.takePhoto({flash: 'off'});
        capturedPath = photo.path;
        const base64 = await readPhotoBase64(photo.path);
        const res = base64 ? await detectLabels(base64) : {ok: false, labels: []};
        if (res.ok) {
          // Real recognition: a miss gets a gentle retry, never an error.
          matched = !!labelsMatch(res.labels, theme);
        } else {
          // Vision unavailable (no key / offline): stay generous so kids never stall.
          matched = true;
        }
      } else {
        // No camera device (e.g. emulator): treat the tap as a find.
        matched = true;
      }
    } catch {
      matched = true;
    }

    if (matched) {
      // Only a real find is kept, so the day's album holds exactly the goal shots.
      if (capturedPath) {
        savePhoto(capturedPath, theme.id);
      }
      registerFind();
    } else {
      gentleRetry();
    }
  }, [busy, found, device, theme, fireFlash, registerFind, gentleRetry]);

  // Retake mode: one capture replaces the target photo (same day), then return.
  const handleRetake = useCallback(async () => {
    if (busy) {
      return;
    }
    setStatus('checking');
    playShutter();
    fireFlash();

    try {
      if (camera.current && device) {
        const photo = await camera.current.takePhoto({flash: 'off'});
        await retakePhoto(retakePath!, theme.id, retakeDateKey!, photo.path);
      }
    } catch {
      // A failed retake leaves the original photo untouched — that's fine.
    }

    setBurstKey(k => k + 1);
    setStatus('correct');
    setTimeout(() => navigation.goBack(), 900);
  }, [busy, device, retakePath, retakeDateKey, theme, fireFlash, navigation]);

  // ---- Permission gate ----
  if (!hasPermission) {
    return (
      <View style={[styles.gate, {paddingTop: insets.top}]}>
        <Text style={styles.gateEmoji}>📷</Text>
        <Text style={styles.gateTitle}>Please allow the camera</Text>
        <Text style={styles.gateSub}>We need it to spot {theme.emoji} around you!</Text>
        <View style={{height: 28}} />
        <PillButton label="Allow camera 👍" color={colors.sunny} onPress={requestPermission} />
        <View style={{height: 14}} />
        <PillButton
          label="Open settings ⚙️"
          size="md"
          color={colors.white}
          onPress={() => Linking.openSettings()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Camera preview (or a soft placeholder if no device is available) */}
      {device ? (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isRetake || found < theme.goal}
          photo
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.noDevice]}>
          <Text style={styles.noDeviceEmoji}>🌿📷🌿</Text>
          <Text style={styles.noDeviceText}>Point me at real things!</Text>
        </View>
      )}

      {/* Shutter flash */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />

      {/* Confetti on each find */}
      <RewardBurst fireKey={burstKey} />

      {/* Top mission bar */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[styles.topBar, {paddingTop: insets.top + 12}]}>
        <View style={styles.missionPill}>
          <Text style={styles.missionText}>
            {isRetake ? 'Retake your photo' : theme.missionText} {theme.emoji}
          </Text>
        </View>
        {!isRetake && (
          <>
            <View style={{height: 10}} />
            <ProgressStars found={found} goal={theme.goal} />
          </>
        )}
      </Animated.View>

      {/* Mascot that bounces on each find */}
      <View style={styles.mascotCorner} pointerEvents="none">
        <MotiView
          key={bounceKey}
          from={{scale: 1, translateY: 0}}
          animate={{scale: bounceKey > 0 ? 1.25 : 1, translateY: bounceKey > 0 ? -18 : 0}}
          transition={{type: 'spring', damping: 8, stiffness: 220}}>
          <Text style={styles.cornerMascot}>🌱</Text>
        </MotiView>
      </View>

      {/* "looking…" chip */}
      {status === 'checking' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.lookingChip}>
          <Text style={styles.lookingText}>looking… 🔍</Text>
        </Animated.View>
      )}

      {/* Reward card */}
      {status === 'correct' && (
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View style={styles.starBurstWrap}>
            <LottieSafe source={starBurst} fallbackEmoji="⭐" size={240} loop={false} />
          </View>
          <Animated.View
            key={burstKey}
            entering={ZoomIn.springify().damping(9)}
            exiting={FadeOut.duration(300)}
            style={styles.rewardCard}>
            <Text style={styles.rewardEmoji}>{isRetake ? '📸' : '⭐'}</Text>
            <Text style={styles.rewardText}>
              {isRetake ? 'Nice shot!' : `It's a ${theme.targetLabel}!`}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Retry banner */}
      {status === 'retry' && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          pointerEvents="none"
          style={styles.retryBanner}>
          <Text style={styles.retryText}>Hmm, try again! 🔍</Text>
        </Animated.View>
      )}

      {/* Bottom controls */}
      <View style={[styles.bottom, {paddingBottom: insets.bottom + 18}]}>
        <GlowingCaptureButton
          onCapture={isRetake ? handleRetake : handleCapture}
          busy={busy}
          shakeKey={shakeKey}
        />
        <View style={{height: 18}} />
        {isRetake ? (
          <PillButton
            label="Cancel ✖️"
            size="md"
            color={colors.white}
            textColor={colors.primaryDark}
            onPress={() => {
              if (!busy) {
                navigation.goBack();
              }
            }}
          />
        ) : (
          <PillButton
            label="✅ I found it!"
            size="md"
            color={colors.white}
            textColor={colors.primaryDark}
            onPress={() => {
              if (!busy && found < theme.goal) {
                registerFind();
              }
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.ink},
  noDevice: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDeviceEmoji: {fontSize: 56, marginBottom: 10},
  noDeviceText: {fontFamily: fonts.bold, fontSize: fontSizes.body, color: colors.white},
  flash: {backgroundColor: colors.white},

  topBar: {position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center'},
  missionPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 26,
    paddingVertical: 12,
    ...shadow.soft,
  },
  missionText: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.body,
    fontWeight: '800',
    color: colors.white,
  },

  mascotCorner: {position: 'absolute', top: 96, right: 14},
  cornerMascot: {fontSize: 54},

  lookingChip: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    backgroundColor: colors.overlayStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  lookingText: {fontFamily: fonts.bold, fontSize: fontSizes.body, color: colors.white},

  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBurstWrap: {position: 'absolute', alignItems: 'center', justifyContent: 'center'},
  rewardCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingHorizontal: 34,
    paddingVertical: 26,
    alignItems: 'center',
    ...shadow.lift,
  },
  rewardEmoji: {fontSize: fontSizes.emoji, marginBottom: 4},
  rewardText: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.heading,
    fontWeight: '900',
    color: colors.primaryDark,
  },

  retryBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    backgroundColor: colors.sky,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...shadow.soft,
  },
  retryText: {fontFamily: fonts.heavy, fontSize: fontSizes.body, fontWeight: '800', color: colors.white},

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  gate: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  gateEmoji: {fontSize: 88, marginBottom: 16},
  gateTitle: {
    fontFamily: fonts.heavy,
    fontSize: fontSizes.title,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
  },
  gateSub: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.body,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
  },
});
