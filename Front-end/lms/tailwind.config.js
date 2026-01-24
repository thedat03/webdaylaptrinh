/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb',
                    dark: '#1d4ed8',
                },
                secondary: {
                    DEFAULT: '#7c3aed',
                    dark: '#6d28d9',
                },
                accent: {
                    DEFAULT: '#ef4444',
                    dark: '#dc2626',
                },
                warning: {
                    DEFAULT: '#facc15',
                    dark: '#cc9900ff',
                },
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeInUp: 'fadeInUp 0.8s ease-out forwards',
                fadeIn: 'fadeIn 0.5s ease-in-out',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(to right, #2563eb, #7c3aed)',
            },
        },
    },
    plugins: [],
};