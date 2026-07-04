module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 ships its worklets transform in react-native-worklets.
  // This MUST be the last entry in the plugins list.
  plugins: ['react-native-worklets/plugin'],
};
