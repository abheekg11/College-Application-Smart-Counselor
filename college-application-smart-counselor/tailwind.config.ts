import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: 'var(--color-sage)',
        terracotta: 'var(--color-terracotta)',
        charcoal: 'var(--color-charcoal)',
        muted: 'var(--color-muted)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
      },
    },
  },
  plugins: [],
}
export default config
