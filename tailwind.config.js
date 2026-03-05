/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f4f7fb',
          ink: '#0f172a',
          primary: '#0ea5e9',
          accent: '#f43f5e',
          muted: '#64748b',
          success: '#059669',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        body: ['"IBM Plex Sans"', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 12px 30px -18px rgba(15, 23, 42, 0.35)',
      },
      borderRadius: {
        card: '1rem',
        pill: '9999px',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};
