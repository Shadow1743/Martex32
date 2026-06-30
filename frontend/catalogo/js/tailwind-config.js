tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'verde-quirurgico': {
                    DEFAULT: '#00B391', // Más vibrante que el original
                    dark: '#009B7D',
                    light: '#E5F7F4'
                },
                'azul-pantera': {
                    DEFAULT: '#1B1464',
                    light: '#281F8C'
                },
                'azul-marino': {
                    DEFAULT: '#0A1128',
                    dark: '#050914'
                },
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'display': ['Outfit', 'Inter', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: { 
                    '0%': { opacity: '0' }, 
                    '100%': { opacity: '1' } 
                },
                slideUp: { 
                    '0%': { transform: 'translateY(30px)', opacity: '0' }, 
                    '100%': { transform: 'translateY(0)', opacity: '1' } 
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(10, 17, 40, 0.1)',
                'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 20px rgba(0, 179, 145, 0.4)'
            }
        }
    }
}
