(function() {
    const martexTailwindConfig = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    'verde-quirurgico': {
                        DEFAULT: '#0D6E61',
                        dark: '#0A5A4F',
                        light: '#EBF6F4',
                        accent: '#14B8A6',
                        50: '#F0FDF9',
                        100: '#CCFBF1',
                        600: '#0D6E61',
                        700: '#0A5A4F'
                    },
                    'azul-pantera': {
                        DEFAULT: '#14213D',
                        light: '#1F2E4D',
                        dark: '#0D1629'
                    },
                    'azul-marino': {
                        DEFAULT: '#0A1428',
                        dark: '#060D1A',
                        slate: '#1E293B',
                        card: '#0F1A2E'
                    },
                    'lino': {
                        DEFAULT: '#FAF9F6',
                        dark: '#F3EFEA'
                    },
                    'champagne': {
                        DEFAULT: '#C59B27',
                        light: '#F3E5AB',
                        dark: '#9A7718'
                    }
                },
                fontFamily: {
                    'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                    'display': ['Outfit', 'Inter', 'sans-serif']
                },
                animation: {
                    'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                },
                keyframes: {
                    fadeIn: { 
                        '0%': { opacity: '0' }, 
                        '100%': { opacity: '1' } 
                    },
                    slideUp: { 
                        '0%': { transform: 'translateY(16px)', opacity: '0' }, 
                        '100%': { transform: 'translateY(0)', opacity: '1' } 
                    }
                },
                boxShadow: {
                    'xs': '0 1px 2px 0 rgba(10, 20, 40, 0.04)',
                    'glass': '0 8px 30px rgba(10, 20, 40, 0.06)',
                    'premium': '0 20px 40px -15px rgba(10, 20, 40, 0.08)',
                    'card': '0 4px 20px -2px rgba(10, 20, 40, 0.05)',
                    'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
                    'glow': '0 0 25px rgba(13, 110, 97, 0.25)',
                    'elevated': '0 12px 30px -4px rgba(13, 110, 97, 0.12)'
                }
            }
        }
    };

    window.tailwind = window.tailwind || {};
    window.tailwind.config = martexTailwindConfig;

    if (typeof tailwind !== 'undefined') {
        try {
            tailwind.config = martexTailwindConfig;
        } catch(e) {}
    }
})();

