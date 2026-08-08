tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'verde-quirurgico': {
                    DEFAULT: '#0D6E61', // Verde esmeralda sastre sofisticado
                    dark: '#0A5A4F',
                    light: '#EBF6F4',
                    accent: '#14B8A6'
                },
                'azul-pantera': {
                    DEFAULT: '#14213D',
                    light: '#1F2E4D',
                    dark: '#0D1629'
                },
                'azul-marino': {
                    DEFAULT: '#0A1428', // Azul sastre profundo
                    dark: '#060D1A',
                    slate: '#1E293B'
                },
                'lino': {
                    DEFAULT: '#FAF8F5',
                    dark: '#F3EFEA'
                },
                'champagne': {
                    DEFAULT: '#D4AF37',
                    light: '#F3E5AB'
                }
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                'display': ['Outfit', 'Inter', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
            keyframes: {
                fadeIn: { 
                    '0%': { opacity: '0' }, 
                    '100%': { opacity: '1' } 
                },
                slideUp: { 
                    '0%': { transform: 'translateY(24px)', opacity: '0' }, 
                    '100%': { transform: 'translateY(0)', opacity: '1' } 
                }
            },
            boxShadow: {
                'glass': '0 8px 30px rgba(10, 20, 40, 0.06)',
                'premium': '0 20px 40px -15px rgba(10, 20, 40, 0.08)',
                'card': '0 4px 20px -2px rgba(10, 20, 40, 0.05)',
                'glow': '0 0 25px rgba(13, 110, 97, 0.25)'
            }
        }
    }
}
