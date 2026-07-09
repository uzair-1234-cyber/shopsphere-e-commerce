import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg';
  forceTheme?: 'light' | 'dark';
}

export default function Logo({
  className = '',
  iconOnly = false,
  showSlogan = true,
  size = 'md',
  forceTheme,
}: LogoProps) {
  // Determine sizing classes
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const sloganSizes = {
    sm: 'text-[8px] tracking-[0.15em]',
    md: 'text-[9px] tracking-[0.2em]',
    lg: 'text-xs tracking-[0.25em]',
  };

  // Determine text color overrides for forceTheme
  const textColorClass = forceTheme === 'dark'
    ? 'text-white'
    : forceTheme === 'light'
      ? 'text-zinc-900'
      : 'text-zinc-900 dark:text-white';

  const sphereColorClass = forceTheme === 'dark'
    ? 'text-indigo-400'
    : forceTheme === 'light'
      ? 'text-indigo-600'
      : 'text-indigo-600 dark:text-indigo-400';

  const sloganColorClass = forceTheme === 'dark'
    ? 'text-zinc-400'
    : forceTheme === 'light'
      ? 'text-zinc-500'
      : 'text-zinc-400 dark:text-zinc-500';

  return (
    <div className={`flex items-center select-none ${className}`} id="brand-logo">
      {/* High-fidelity Vector SVG Icon representing ShopSphere */}
      <div className={`${iconSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105 mr-2.5`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Defs for gradients and filters */}
          <defs>
            {/* Soft shadow for the arrow */}
            <filter id="arrow-shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0d436c" floodOpacity="0.25" />
            </filter>
            
            {/* Master Gradient from light cyan to deep royal blue */}
            <linearGradient id="spheric-gradient" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />   {/* Vibrant Cyan */}
              <stop offset="45%" stopColor="#0088FF" />  {/* Sky Blue */}
              <stop offset="100%" stopColor="#0a3e72" /> {/* Rich Steel Blue */}
            </linearGradient>

            {/* Gradient for the trending swooshing arrow */}
            <linearGradient id="arrow-gradient" x1="15" y1="75" x2="88" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="60%" stopColor="#00D2FF" />
              <stop offset="100%" stopColor="#00F5FF" />
            </linearGradient>
          </defs>

          {/* 1. Shopping Bag Handle (Arch) */}
          <path
            d="M 36 34 C 36 24, 64 24, 64 34"
            stroke="url(#spheric-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* 2. Top Bar of Shopping Bag */}
          <path
            d="M 28 36 L 72 36"
            stroke="url(#spheric-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 3. Globe / Sphere Outline */}
          <circle
            cx="50"
            cy="58"
            r="23"
            stroke="url(#spheric-gradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. Globe Meridians (Vertical Grid Lines) */}
          {/* Left meridian */}
          <path
            d="M 50 35 A 23 23 0 0 0 50 81"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            fill="none"
          />
          {/* Outer Meridians (Ellipses) */}
          <path
            d="M 50 35 C 34 35, 34 81, 50 81"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            fill="none"
          />
          <path
            d="M 50 35 C 66 35, 66 81, 50 81"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* 5. Globe Parallels (Horizontal Grid Lines) */}
          {/* Equator */}
          <path
            d="M 27 58 L 73 58"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.75"
          />
          {/* Latitude lines (Upper & Lower) */}
          <path
            d="M 31 48 Q 50 51, 69 48"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.5"
            fill="none"
          />
          <path
            d="M 31 68 Q 50 65, 69 68"
            stroke="url(#spheric-gradient)"
            strokeWidth="2.5"
            strokeOpacity="0.5"
            fill="none"
          />

          {/* 6. Dynamic Upward Swoosh and Arrow */}
          {/* The swooshing track that starts bottom-left, wraps around, and launches up-right */}
          <path
            d="M 16 64 C 14 60, 20 54, 30 52 C 45 49, 65 42, 84 38"
            stroke="url(#arrow-gradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#arrow-shadow)"
          />
          
          {/* Arrowhead pointed up-right */}
          <path
            d="M 75 34 L 88 36 L 84 49 Z"
            fill="url(#arrow-gradient)"
            filter="url(#arrow-shadow)"
          />
        </svg>
      </div>

      {/* Brand Text & Slogan */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-tight">
          <span className={`font-sans font-bold tracking-tight ${textColorClass} ${textSizes[size]}`}>
            Shop<span className={sphereColorClass}>Sphere</span>
          </span>
          {showSlogan && (
            <span className={`font-sans font-medium uppercase mt-0.5 ${sloganColorClass} ${sloganSizes[size]}`}>
              Global. Digital. Seamless.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
