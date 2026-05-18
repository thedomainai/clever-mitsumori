import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        excess: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config
