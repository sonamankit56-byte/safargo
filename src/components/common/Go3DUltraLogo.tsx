import React from 'react';
import { Sparkles, Crown, Zap } from 'lucide-react';

interface Go3DUltraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  showTagline?: boolean;
  interactive?: boolean;
  className?: string;
}

export const Go3DUltraLogo: React.FC<Go3DUltraLogoProps> = ({
  size = 'md',
  showBadge = true,
  badgeText = 'SPECIAL AGENT',
  showTagline = false,
  interactive = true,
  className = '',
}) => {
  const config = {
    sm: {
      cube: 'w-7 h-7',
      svg: 16,
      goText: 'text-lg',
      badge: 'text-[8px] px-1.5 py-0.2',
      tagline: 'text-[9px]',
      coin: 'w-3.5 h-3.5 text-[8px]',
    },
    md: {
      cube: 'w-10 h-10',
      svg: 22,
      goText: 'text-2xl',
      badge: 'text-[9px] px-2 py-0.5',
      tagline: 'text-[10px]',
      coin: 'w-4 h-4 text-[9px]',
    },
    lg: {
      cube: 'w-14 h-14',
      svg: 32,
      goText: 'text-4xl',
      badge: 'text-[10px] px-2.5 py-0.5',
      tagline: 'text-xs',
      coin: 'w-5 h-5 text-[10px]',
    },
    xl: {
      cube: 'w-20 h-20',
      svg: 44,
      goText: 'text-6xl',
      badge: 'text-xs px-3.5 py-1',
      tagline: 'text-sm',
      coin: 'w-6 h-6 text-xs',
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${interactive ? 'group cursor-pointer' : ''} ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Isometric Rotating Emblem */}
      <div className="relative flex items-center shrink-0">
        {/* Outer 3D Neon Orbit Ring */}
        <div
          className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-cyan-400 opacity-60 blur-md group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 animate-pulse"
        />

        {/* 3D Secondary Cyber Glow Ring */}
        <div
          className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-500 to-emerald-400 opacity-80"
          style={{ filter: 'blur(2px)' }}
        />

        {/* The 3D Cube / Bus Emblem */}
        <div
          className={`relative ${config.cube} rounded-2xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600 border-2 border-white/80 flex items-center justify-center shadow-2xl transform-gpu transition-all duration-500 ${
            interactive ? 'group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:scale-110' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow:
              '0 15px 35px -5px rgba(245, 158, 11, 0.7), inset 0 3px 6px rgba(255, 255, 255, 0.9), inset 0 -3px 6px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Animated 3D Glass Light Sweep */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
          </div>

          {/* 3D Bus Hologram SVG */}
          <svg
            width={config.svg}
            height={config.svg}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-md"
          >
            {/* Ground shadow */}
            <path d="M14 44L20 32H28L34 44H14Z" fill="rgba(15, 23, 42, 0.45)" />
            <line x1="24" y1="34" x2="24" y2="42" stroke="#FEF08A" strokeWidth="2" strokeDasharray="2 2" />
            
            {/* Bus Body */}
            <rect x="11" y="7" width="26" height="27" rx="5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.8" />
            {/* Top Roof */}
            <path d="M13 12C13 9.79086 14.7909 8 17 8H31C33.2091 8 35 9.79086 35 12V14H13V12Z" fill="#EA580C" />
            {/* Windshield */}
            <rect x="14" y="15" width="20" height="9" rx="2" fill="#0F172A" />
            {/* Headlights with glow */}
            <circle cx="16.5" cy="29.5" r="2.2" fill="#FBBF24" />
            <circle cx="31.5" cy="29.5" r="2.2" fill="#FBBF24" />
          </svg>

          {/* 3D Floating Gold Coin Badge */}
          <span
            className={`absolute -top-1.5 -right-1.5 ${config.coin} rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center border border-white shadow-lg`}
          >
            ₹
          </span>
        </div>
      </div>

      {/* 3D Brand Typography */}
      <div className="flex flex-col leading-none">
        {showBadge && (
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`inline-flex items-center gap-1 font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-slate-950 rounded-full shadow-xs ${config.badge}`}
            >
              <Crown className="w-2.5 h-2.5 inline shrink-0" />
              <span>{badgeText}</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              ₹20/Booking
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5">
          {/* Extruded 3D "GO" Lettering */}
          <span
            className={`${config.goText} font-black tracking-tighter bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm`}
            style={{
              textShadow:
                '0 1px 0 #b45309, 0 2px 0 #92400e, 0 4px 10px rgba(245, 158, 11, 0.5)',
            }}
          >
            GO
          </span>

          <span
            className={`${config.goText} font-black tracking-tight text-white drop-shadow-sm`}
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
            }}
          >
            Special Agent
          </span>
        </div>

        {showTagline && (
          <p className={`${config.tagline} text-slate-400 font-semibold tracking-wide mt-1 flex items-center gap-1`}>
            <Zap className="w-3 h-3 text-amber-400 inline" />
            <span>Ultra 3D High-Speed Booking Terminal</span>
          </p>
        )}
      </div>
    </div>
  );
};
