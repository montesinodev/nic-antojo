const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// The 'input' points to your global CSS file where Tailwind is injected
module.exports = withNativeWind(config, { input: "./global.css" });
