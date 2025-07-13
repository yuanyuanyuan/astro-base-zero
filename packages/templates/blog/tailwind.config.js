/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          100: 'color-mix(in srgb, var(--color-primary) 20%, white)',
          200: 'color-mix(in srgb, var(--color-primary) 40%, white)',
          300: 'color-mix(in srgb, var(--color-primary) 60%, white)',
          400: 'color-mix(in srgb, var(--color-primary) 80%, white)',
          500: 'var(--color-primary)',
          600: 'color-mix(in srgb, var(--color-primary) 80%, black)',
          700: 'color-mix(in srgb, var(--color-primary) 60%, black)',
          800: 'color-mix(in srgb, var(--color-primary) 40%, black)',
          900: 'color-mix(in srgb, var(--color-primary) 20%, black)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          50: 'color-mix(in srgb, var(--color-accent) 10%, white)',
          100: 'color-mix(in srgb, var(--color-accent) 20%, white)',
          200: 'color-mix(in srgb, var(--color-accent) 40%, white)',
          300: 'color-mix(in srgb, var(--color-accent) 60%, white)',
          400: 'color-mix(in srgb, var(--color-accent) 80%, white)',
          500: 'var(--color-accent)',
          600: 'color-mix(in srgb, var(--color-accent) 80%, black)',
          700: 'color-mix(in srgb, var(--color-accent) 60%, black)',
          800: 'color-mix(in srgb, var(--color-accent) 40%, black)',
          900: 'color-mix(in srgb, var(--color-accent) 20%, black)',
        },
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        text: 'var(--color-text)',
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-code)', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}; 