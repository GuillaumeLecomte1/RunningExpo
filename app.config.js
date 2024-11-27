module.exports = {
  name: 'ExpoApp',
  // ... autres configurations ...
  web: {
    bundler: 'metro',
    build: {
      babel: {
        include: ['react-native-maps'],
      },
    },
  },
}; 