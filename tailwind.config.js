const { themeColors } = require("./theme.config");
const plugin = require("tailwindcss/plugin");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: `var(--color-${name})`,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

// Pantheon-specific color utilities
const pantheonColors = {
  "pantheon-greek": "#1e90ff",
  "pantheon-norse": "#87ceeb",
  "pantheon-egyptian": "#ffd700",
  "pantheon-tolkien": "#4169e1",
  "pantheon-celtic": "#9370db",
  "pantheon-hindu": "#ffd700",
  "pantheon-japanese": "#dc143c",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Scan all component and app files for Tailwind classes
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { ...tailwindColors, ...pantheonColors },
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 0 30px rgba(212, 175, 55, 0.5)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" },
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
      addVariant("dark", ':root[data-theme="dark"] &');
    }),
  ],
};
