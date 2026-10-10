import React from 'react';

interface SafarGoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showBadge?: boolean;
  variant?: 'light' | 'dark'; // 'light' for dark navbars, 'dark' for white/light cards
  interactive?: boolean;
  className?: string;
}

export const SafarGoLogo: React.FC<SafarGoLogoProps> = ({
  size = 'md',
  showTagline = true,
  showBadge = true,
  variant = 'light',
  interactive = true,
  className = ''
}) => {
  // Size configurations
  const config = {
    sm: {
      boxSize: 'w-8 h-8',
      svgSize: 22,
      titleSize: 'text-base',
      badgeSize: 'text-[9px] px-1 py-0.2',
      taglineSize: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      boxSize: 'w-10 h-10',
      svgSize: 26,
      titleSize: 'text-xl',
      badgeSize: 'text-[10px] px-1.5 py-0.5',
      taglineSize: 'text-[11px]',
      gap: 'gap-3',
    },
    lg: {
      boxSize: 'w-13 h-13',
      svgSize: 34,
      titleSize: 'text-2xl sm:text-3xl',
      badgeSize: 'text-[11px] px-2 py-0.5',
      taglineSize: 'text-xs sm:text-sm',
      gap: 'gap-3.5',
    },
    xl: {
      boxSize: 'w-18 h-18',
      svgSize: 46,
      titleSize: 'text-3xl sm:text-4xl',
      badgeSize: 'text-xs px-2.5 py-1',
      taglineSize: 'text-sm sm:text-base',
      gap: 'gap-4',
    },
  }[size];

  const isLight = variant === 'light';

  return (
    <div
      className={`inline-flex items-center ${config.gap} select-none group ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ perspective: '800px' }}
    >
      {/* 3D Animated Bus Emblem */}
      <div
        className={`relative ${config.boxSize} rounded-2xl flex items-center justify-center shrink-0 
          bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 
          border border-orange-300/40 shadow-lg shadow-orange-500/30 
          transition-all duration-300 transform-gpu
          ${interactive ? 'group-hover:scale-105 group-hover:rotate-[-3deg] group-hover:shadow-orange-500/60' : ''}
          animate-float3d`}
        style={{
          boxShadow: '0 8px 20px -3px rgba(249, 115, 22, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Shimmer light sweep */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] transform -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-out"
          />
        </div>

        {/* 3D Modern Aerodynamic Bus SVG */}
        <svg
          width={config.svgSize}
          height={config.svgSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-md"
        >
          {/* Highway Road Perspective */}
          <path
            d="M14 44L20 32H28L34 44H14Z"
            fill="rgba(15, 23, 42, 0.35)"
          />
          {/* Road center dash */}
          <line
            x1="24"
            y1="34"
            x2="24"
            y2="42"
            stroke="#FEF08A"
            strokeWidth="2"
            strokeDasharray="2 2"
            strokeLinecap="round"
          />

          {/* Bus 3D Body Outline */}
          <rect
            x="11"
            y="7"
            width="26"
            height="27"
            rx="5"
            fill="#FFFFFF"
            stroke="#EA580C"
            strokeWidth="1.5"
          />
          
          {/* Windshield */}
          <rect
            x="14"
            y="10"
            width="20"
            height="11"
            rx="2.5"
            fill="url(#windshieldGrad)"
          />
          {/* Windshield shine reflection */}
          <path
            d="M15 11L21 20H18L14 13C14 11.9 14.9 11 15 11Z"
            fill="white"
            fillOpacity="0.45"
          />

          {/* Grille & Number Plate Area */}
          <rect x="17" y="24" width="14" height="4" rx="1.5" fill="#0F172A" />
          <line x1="19" y1="26" x2="29" y2="26" stroke="#FB923C" strokeWidth="1" strokeLinecap="round" />

          {/* Dual LED Headlights */}
          <circle cx="14.5" cy="25" r="2.2" fill="#FEF08A" filter="url(#glowHeadlight)" />
          <circle cx="14.5" cy="25" r="1.2" fill="#FFFFFF" />
          <circle cx="33.5" cy="25" r="2.2" fill="#FEF08A" filter="url(#glowHeadlight)" />
          <circle cx="33.5" cy="25" r="1.2" fill="#FFFFFF" />

          {/* Side mirrors */}
          <path d="M8 15C8 14 9.5 13.5 11 14V17C9.5 17.5 8 16.5 8 15Z" fill="#FFFFFF" />
          <path d="M40 15C40 14 38.5 13.5 37 14V17C38.5 17.5 40 16.5 40 15Z" fill="#FFFFFF" />

          {/* Bus Wheels */}
          <rect x="12" y="32" width="4.5" height="5" rx="1.5" fill="#0F172A" />
          <rect x="31.5" y="32" width="4.5" height="5" rx="1.5" fill="#0F172A" />

          {/* Speed Wing / Arrow on roof */}
          <path
            d="M18 5L24 2L30 5"
            stroke="#FEF08A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <defs>
            <linearGradient id="windshieldGrad" x1="24" y1="10" x2="24" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
            <filter id="glowHeadlight" x="11" y="21" width="26" height="8" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1" result="blur" />
            </filter>
          </defs>
        </svg>

        {/* 3D Depth Bottom Edge highlight */}
        <div className="absolute -bottom-1 left-2 right-2 h-1 bg-black/25 rounded-full blur-xs pointer-events-none" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${config.titleSize} transition-colors ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            Safar
          </span>
          <span
            className={`font-black ${config.titleSize} bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent drop-shadow-xs`}
          >
            Go
          </span>

          {showBadge && (
            <span
              className={`font-black tracking-wider uppercase rounded-full shrink-0 border ml-0.5 ${config.badgeSize} ${
                isLight
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30 shadow-xs'
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }`}
            >
              3D Live
            </span>
          )}
        </div>

        {showTagline && (
          <p
            className={`font-semibold tracking-wide mt-0.5 leading-tight ${config.taglineSize} ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            अब हर सफर होगा आसान
          </p>
        )}
      </div>
    </div>
  );
};
