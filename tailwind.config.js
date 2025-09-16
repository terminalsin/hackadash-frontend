import {
    heroui
} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
                hacker: ['Fira Code', 'Share Tech Mono', 'monospace'],
            },
            colors: {
                'hacker-green': '#44FF00',
                'hacker-green-dark': '#33C000',
                'outer-space': '#b3b3b3',
                'night': '#0C0C0C',
                'fluorescent-cyan': '#00FFE5',
                'matrix-bg': '#000000',
                'terminal-green': '#33C000',
                'warning-red': '#FF0040',
            },
            animation: {
                'text-glow': 'textGlow 2s ease-in-out infinite alternate',
                'glitch': 'glitch 2s infinite',
                'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
                'matrix-rain': 'matrixRain 10s linear infinite',
                'card-swipe': 'cardSwipe 0.5s ease-in-out forwards',
                'match-pulse': 'matchPulse 2s ease-in-out infinite',
                'spin': 'spin 1s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
}

module.exports = config;