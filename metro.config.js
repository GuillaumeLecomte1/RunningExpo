const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'],
    platforms: ['ios', 'android', 'web'],
    assetExts: [...defaultConfig.resolver.assetExts, 'json'],
  },
}; 