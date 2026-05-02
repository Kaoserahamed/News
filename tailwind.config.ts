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
    },
  },
  plugins: [],
}
export default config
