const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  resolver: {
    // Bundle .lottie and audio assets alongside the defaults.
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'ttf', 'otf', 'mp3', 'wav', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
