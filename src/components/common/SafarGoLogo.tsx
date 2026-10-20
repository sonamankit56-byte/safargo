import React from 'react';

interface SafarGoLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SafarGoLogo: React.FC<SafarGoLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic SVG Brand Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 drop-shadow-sm transition-transform hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Primary Gradient (Navy to Royal) */}
            <linearGradient id="sfg-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B194C" />
              <stop offset="50%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Accent Gradient (Crimson Red to Coral Orange) */}
            <linearGradient id="sfg-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            {/* Golden Star / Sun Glow */}
            <linearGradient id="sfg-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <filter id="sfg-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Rounded Squircle with Gradient */}
          <rect 
            x="4" 
            y="4" 
            width="92" 
            height="92" 
            rx="24" 
            fill="url(#sfg-shield-grad)" 
            filter="url(#sfg-shadow)"
          />

          {/* Curving Highway / Endless Road with perspective */}
          <path 
            d="M 22 84 L 44 48 L 56 48 L 78 84 Z" 
            fill="#1E293B" 
            opacity="0.85" 
          />
          {/* Highway Center Divider Lines */}
          <line x1="50" y1="52" x2="50" y2="60" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="67" x2="50" y2="78" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />

          {/* Aerodynamic Luxury Bus Contour with windshield & lights */}
          <g transform="translate(0, -2)">
            {/* Bus Body */}
            <path 
              d="M 28 36 C 28 27 34 23 50 23 C 66 23 72 27 72 36 L 73 52 C 73 55 70 57 66 57 L 34 57 C 30 57 27 55 27 52 Z" 
              fill="white" 
            />
            {/* Front Big Tinted Windshield */}
            <path 
              d="M 32 30 C 35 27 41 26 50 26 C 59 26 65 27 68 30 L 68 40 L 32 40 Z" 
              fill="#0F172A" 
            />
            {/* Windshield Reflection */}
            <path d="M 34 32 L 44 32 L 40 38 L 34 38 Z" fill="white" opacity="0.3" />

            {/* LED Headlights */}
            <rect x="31" y="45" width="7" height="3" rx="1.5" fill="#38BDF8" />
            <rect x="62" y="45" width="7" height="3" rx="1.5" fill="#38BDF8" />
            {/* Front Grille */}
            <line x1="42" y1="47" x2="58" y2="47" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Bus Wheels */}
            <rect x="25" y="50" width="4" height="6" rx="2" fill="#0F172A" />
            <rect x="71" y="50" width="4" height="6" rx="2" fill="#0F172A" />
          </g>

          {/* Dynamic Speed Swoosh Arrow (Crimson Red) */}
          <path 
            d="M 12 60 C 24 38 60 22 88 32 C 78 30 56 36 38 52 C 28 60 20 72 12 60 Z" 
            fill="url(#sfg-accent-grad)" 
          />

          {/* Golden North Star / Compass Beacon */}
          <polygon 
            points="76,14 78,19 83,21 78,23 76,28 74,23 69,21 74,19" 
            fill="url(#sfg-gold-grad)" 
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5 tracking-tight font-black">
            <span className={`${currentSize.text} ${isWhite ? 'text-white' : 'text-[#0B194C]'}`}>
              Safar
            </span>
            <span className={`${currentSize.text} text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] to-[#F97316]`}>
              Go
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 ml-0.5">
              TRAVELS
            </span>
          </div>

          {variant === 'full' && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`${currentSize.sub} font-semibold ${isWhite ? 'text-slate-300' : 'text-slate-500'} tracking-wide`}>
                Bus & Hotel Super App
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
