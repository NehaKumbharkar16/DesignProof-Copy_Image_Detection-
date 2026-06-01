module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#1E293B', // Keep for backward compatibility if needed, but primary is now Forest
        'brand-slate': '#475569',
        'brand-sage': '#86A789',
        'brand-charcoal': '#334155',
        'brand-offwhite': '#F8FAFC',

        // Image-based palette
        'brand-forest': '#3A4D39', // Forest Green
        'brand-gold': '#CA8A04',   // Mustard/Gold
        'brand-pink': '#D946EF',   // Vibrant Pink
        'brand-cream': '#FFFBEB',  // Light Cream
        'brand-dark-footer': '#0B1A2B', // Premium Dark Footer
        'brand-accent-gold': '#F4B400', // Premium Gold Accent
      }
    },
  },
  plugins: [],
}
