/**
 * LottieSafe — renders a Lottie animation, but if the lottie module or the JSON
 * ever fails, it degrades to a bouncing emoji (via Moti) instead of crashing.
 * This keeps the demo bulletproof even if an asset is missing.
 */
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {MotiView} from 'moti';
import {Text} from 'react-native';

type LottieProps = {
  source: any;
  fallbackEmoji: string;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

class Boundary extends React.Component<
  {fallback: React.ReactNode; children: React.ReactNode},
  {failed: boolean}
> {
  state = {failed: false};
  static getDerivedStateFromError() {
    return {failed: true};
  }
  componentDidCatch() {
    /* swallow — fallback shown */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function BouncingEmoji({emoji, size = 160}: {emoji: string; size?: number}) {
  return (
    <MotiView
      from={{scale: 0.9, translateY: 0}}
      animate={{scale: 1.05, translateY: -14}}
      transition={{
        type: 'timing',
        duration: 700,
        loop: true,
        repeatReverse: true,
      }}
      style={{alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{fontSize: size * 0.62}}>{emoji}</Text>
    </MotiView>
  );
}

export function LottieSafe({
  source,
  fallbackEmoji,
  size = 160,
  loop = true,
  autoPlay = true,
  style,
}: LottieProps) {
  // Require lazily so a missing native module can't crash module-eval time.
  let LottieView: any = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    LottieView = require('lottie-react-native').default;
  } catch {
    LottieView = null;
  }

  const fallback = <BouncingEmoji emoji={fallbackEmoji} size={size} />;

  if (!LottieView) {
    return fallback;
  }

  return (
    <Boundary fallback={fallback}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        style={[{width: size, height: size}, style]}
      />
    </Boundary>
  );
}
