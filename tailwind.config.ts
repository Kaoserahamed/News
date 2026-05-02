import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        technology: '#3b82f6',
        sports: '#10b981',
        business: '#f59e0b',
        politics: '#ef4444',
        entertainment: '#8b5cf6',
        general: '#6b7280',
      },
      screens: {
        // Explicit breakpoints for requirements 8.1, 8.2, 8.3
        // Mobile: 320px - 767px (default, no prefix needed)
        // Tablet: 768px - 1023px (md prefix)
        // Desktop: 1024px+ (lg prefix)
        'xs': '320px',   // Extra small devices
        'sm': '640px',   // Small devices
        'md': '768px',   // Tablet devices (Requirement 8.2 boundary)
        'lg': '1024px',  // Desktop devices (Requirement 8.3 boundary)
        'xl': '1280px',  // Large desktop
        '2xl': '1536px', // Extra large desktop
        '3xl': '2560px', // Maximum supported width (Requirement 8.1)
      },
    },
  },
  plugins: [],
}
export default config
