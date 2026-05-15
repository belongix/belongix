const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
const MOCK = path.resolve(__dirname, 'ws-mock.js');
config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  zlib: require.resolve('browserify-zlib'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  http: MOCK,
  https: MOCK,
  net: MOCK,
  tls: MOCK,
  ws: MOCK,
  crypto: MOCK,
  url: MOCK,
};
module.exports = config;