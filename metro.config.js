const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude react-native-css-interop's generated cache files from Metro's
// file watcher — Metro tries to hash these before NativeWind creates them,
// which causes a SHA-1 error during web builds.
config.resolver.blockList = [
  /node_modules\/react-native-css-interop\/\.cache\/.*/,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
