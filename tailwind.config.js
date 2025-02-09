/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'panel': '#2A2A2A',
                'grid-cell': '#1A1A1A',
                'grid-cell-active': '#3B82F6',
            }
        },
    },
    plugins: [],
    future: {
        hoverOnlyWhenSupported: true,
    },
}
