module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for React Native Reanimated — must be last plugin
      'react-native-reanimated/plugin',
    ],
  };
};
