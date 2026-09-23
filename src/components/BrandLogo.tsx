import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogo({ size = 'md', showSubtitle = true, className = '' }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: {
      title: 'text-base',
      badge: 'text-[9px] px-1.5 py-0.2',
      sub: 'text-[10px]',
    },
    md: {
      title: 'text-xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-[11px]',
    },
    lg: {
      title: 'text-2xl',
      badge: 'text-xs px-2.5 py-0.5',
      sub: 'text-xs',
    },
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Dynamic Cyber Nexus Mark */}
      <div className="relative shrink-0">
        {/* Ambient Glow Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0df2a4]/40 via-cyan-500/30 to-[#0df2a4]/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-80" />

        {/* Outer Icon Container */}
        <div
          className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-[#0e2733] via-[#071722] to-[#040e16] p-[1.5px] border border-[#0df2a4]/40 shadow-[0_0_20px_rgba(13,242,164,0.35)] group-hover:scale-105 group-hover:border-[#0df2a4] transition-all duration-300 flex items-center justify-center`}
        >
          {/* Custom Crafted Geometric Emblem: S & C Circuit Connector */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1.5"
          >
            <defs>
              <linearGradient id="scGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0df2a4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#00f5c4" />
              </linearGradient>
              <linearGradient id="scGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0df2a4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#0df2a4" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Circuit Background Grid lines */}
            <path
              d="M10 24H16M32 24H38M24 10V16M24 32V38"
              stroke="#0df2a4"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Outer Hexagonal Shield Ring */}
            <path
              d="M24 6L39 15V33L24 42L9 33V15L24 6Z"
              stroke="url(#scGlow)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Inner Connector Loop forming S & C interplay */}
            <path
              d="M31 16C28 13.5 22 13.5 19 16.5C16 19.5 17 23 21 24C26 25.5 29 27.5 28 31.5C27 35 21 35.5 17 33"
              stroke="url(#scGradient)"
              strokeWidth="3.2"
              strokeLinecap="round"
              filter="url(#neonGlow)"
            />

            {/* Central Lightning / Connection Spark Node */}
            <circle cx="24" cy="24" r="2.5" fill="#ffffff" filter="url(#neonGlow)" />

            {/* Terminal Connection Node dots */}
            <circle cx="31" cy="16" r="2" fill="#0df2a4" />
            <circle cx="17" cy="33" r="2" fill="#38bdf8" />
          </svg>

          {/* Micro Status Beacon */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df2a4] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0df2a4] border-2 border-[#071117]"></span>
          </span>
        </div>
      </div>

      {/* Typography & Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-display font-extrabold ${textSizes[size].title} tracking-tight text-white group-hover:text-slate-100 transition-colors flex items-center`}
          >
            Seva<span className="text-[#0df2a4] ml-0.5">Connect</span>
          </span>

          <span
            className={`${textSizes[size].badge} font-bold tracking-wider bg-[#0df2a4]/15 text-[#0df2a4] border border-[#0df2a4]/40 rounded-full uppercase shadow-[0_0_8px_rgba(13,242,164,0.25)] hidden 2xl:flex items-center gap-1 shrink-0`}
          >
            <span className="w-1 h-1 rounded-full bg-[#0df2a4] animate-pulse"></span>
            VERIFIED PRO
          </span>
        </div>

        {showSubtitle && (
          <p className={`${textSizes[size].sub} text-teal-300/70 font-medium tracking-wide`}>
            Doorstep Verified Services &amp; Technicians
          </p>
        )}
      </div>
    </div>
  );
}
