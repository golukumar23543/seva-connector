import React, { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Wrench,
  Snowflake,
  Tv,
  Hammer,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ServiceNodeConfig {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  bgIconColor: string;
  initialAngle: number; // in radians
}

const SERVICE_NODES: ServiceNodeConfig[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    category: 'Electrician',
    icon: Zap,
    accentColor: '#facc15', // yellow/gold
    glowColor: 'rgba(250, 204, 21, 0.45)',
    borderColor: 'rgba(250, 204, 21, 0.55)',
    textColor: 'text-yellow-300',
    bgIconColor: 'bg-yellow-400/15 text-yellow-400',
    initialAngle: 0, // 0 deg
  },
  {
    id: 'plumber',
    name: 'Plumber',
    category: 'Plumber',
    icon: Wrench,
    accentColor: '#38bdf8', // blue
    glowColor: 'rgba(56, 189, 248, 0.45)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    textColor: 'text-sky-300',
    bgIconColor: 'bg-sky-400/15 text-sky-400',
    initialAngle: (Math.PI * 2) / 6, // 60 deg
  },
  {
    id: 'ac-care',
    name: 'AC Care',
    category: 'AC Specialist',
    icon: Snowflake,
    accentColor: '#06b6d4', // cyan
    glowColor: 'rgba(6, 182, 212, 0.45)',
    borderColor: 'rgba(6, 182, 212, 0.55)',
    textColor: 'text-cyan-300',
    bgIconColor: 'bg-cyan-400/15 text-cyan-400',
    initialAngle: (Math.PI * 2 * 2) / 6, // 120 deg
  },
  {
    id: 'appliance',
    name: 'Appliance',
    category: 'Appliance Repair',
    icon: Tv,
    accentColor: '#c084fc', // purple
    glowColor: 'rgba(192, 132, 252, 0.45)',
    borderColor: 'rgba(192, 132, 252, 0.55)',
    textColor: 'text-purple-300',
    bgIconColor: 'bg-purple-400/15 text-purple-400',
    initialAngle: (Math.PI * 2 * 3) / 6, // 180 deg
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    category: 'Carpenter & Woodwork',
    icon: Hammer,
    accentColor: '#fb923c', // amber/orange
    glowColor: 'rgba(251, 146, 60, 0.45)',
    borderColor: 'rgba(251, 146, 60, 0.55)',
    textColor: 'text-amber-300',
    bgIconColor: 'bg-amber-400/15 text-amber-400',
    initialAngle: (Math.PI * 2 * 4) / 6, // 240 deg
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    category: 'House Deep Cleaning',
    icon: Sparkles,
    accentColor: '#0df2a4', // teal/green
    glowColor: 'rgba(13, 242, 164, 0.45)',
    borderColor: 'rgba(13, 242, 164, 0.55)',
    textColor: 'text-[#0df2a4]',
    bgIconColor: 'bg-emerald-400/15 text-[#0df2a4]',
    initialAngle: (Math.PI * 2 * 5) / 6, // 300 deg
  },
];

interface ServiceNetworkAnimationProps {
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export function ServiceNetworkAnimation({
  onSelectCategory,
  className = '',
}: ServiceNetworkAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Animation state in a ref to avoid unnecessary re-renders when rendering via canvas or SVG
  const [currentAngle, setCurrentAngle] = useState(0);
  const angleRef = useRef(0);
  const [pulseTime, setPulseTime] = useState(0);

  // Center coordinate in 500x500 space
  const CX = 250;
  const CY = 250;
  const ORBIT_RADIUS = 175; // Distance of service nodes from center

  // Track visibility with IntersectionObserver to pause animation when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Continuous animation loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isVisible) {
        // Smooth, elegant counter-clockwise rotation matching the uploaded video (~28s per revolution)
        // If hovered, slows down gracefully so user can interact comfortably
        const speed = isHovered ? 0.08 : 0.22; // radians per second
        // Counter-clockwise: subtract speed * delta
        angleRef.current = (angleRef.current - speed * delta + Math.PI * 2) % (Math.PI * 2);
        setCurrentAngle(angleRef.current);

        setPulseTime((prev) => (prev + delta) % 1000);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isHovered]);

  // Compute positions of each node in 500x500 coordinate space with subtle organic floating
  const nodePositions = SERVICE_NODES.map((node, i) => {
    const angle = angleRef.current + (i * Math.PI * 2) / 6;
    // Tiny organic floating oscillation
    const floatOffset = Math.sin(pulseTime * 2.2 + i * 1.05) * 2.5;
    const r = ORBIT_RADIUS + floatOffset;
    const x = CX + r * Math.cos(angle);
    const y = CY + r * Math.sin(angle);
    return {
      ...node,
      angle,
      x,
      y,
      xPercent: (x / 500) * 100,
      yPercent: (y / 500) * 100,
    };
  });

  // Calculate moving photon particles along the 6 connecting lines
  // Each line has traveling energy pulses moving outwards from the center hub
  const particles = nodePositions.flatMap((node, i) => {
    // 2 staggered particles per line
    return [0, 0.5].map((stagger, pIdx) => {
      const offset = (pulseTime * 0.42 + i * 0.16 + stagger) % 1;
      const startR = 74;
      const endR = ORBIT_RADIUS - 16;
      const currentR = startR + (endR - startR) * offset;
      const px = CX + currentR * Math.cos(node.angle);
      const py = CY + currentR * Math.sin(node.angle);
      // Smooth bell curve opacity
      const opacity = Math.sin(offset * Math.PI) * 0.95;
      return {
        id: `p-${i}-${pIdx}`,
        px,
        py,
        opacity,
        color: node.accentColor,
      };
    });
  });

  // Concentric pulse shockwaves expanding from edge of the central circular hub (r=72)
  const pulseR1 = 72 + ((pulseTime * 35) % 75);
  const pulseOpacity1 = Math.max(0, 0.45 * (1 - (pulseR1 - 72) / 75));

  const pulseR2 = 72 + (((pulseTime + 1.2) * 35) % 75);
  const pulseOpacity2 = Math.max(0, 0.45 * (1 - (pulseR2 - 72) / 75));

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveNodeId(null);
      }}
      className={`relative w-full max-w-[420px] sm:max-w-[460px] aspect-square flex items-center justify-center select-none overflow-visible ${className}`}
      aria-label="SevaConnect Animated Service Network Visualization"
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(13, 242, 164, 0.16) 0%, rgba(6, 182, 212, 0.08) 35%, rgba(4, 10, 16, 0) 70%)',
          filter: 'blur(16px)',
        }}
      />

      {/* SVG Layer: Orbit rings, dynamic connecting lines, and traveling photons */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        <defs>
          {/* Subtle neon cyan glow filter */}
          <filter id="hub-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Particle intense glow */}
          <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.05   0 0 0 0 0.95   0 0 0 0 0.65  0 0 0 1 0"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial gradient for pulse waves */}
          <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#0df2a4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer decorative orbit ring */}
        <circle
          cx={CX}
          cy={CY}
          r={220}
          fill="none"
          stroke="rgba(13, 242, 164, 0.12)"
          strokeWidth="1.2"
        />

        {/* Orbit ring cardinal ticks */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = CX + 220 * Math.cos(rad);
          const y = CY + 220 * Math.sin(rad);
          return (
            <circle
              key={`tick-${deg}`}
              cx={x}
              cy={y}
              r={2}
              fill="rgba(13, 242, 164, 0.35)"
            />
          );
        })}

        {/* Primary dashed orbit line where nodes travel */}
        <circle
          cx={CX}
          cy={CY}
          r={ORBIT_RADIUS}
          fill="none"
          stroke="rgba(13, 242, 164, 0.28)"
          strokeWidth="1.6"
          strokeDasharray="4 6"
        />

        {/* Inner concentric ring */}
        <circle
          cx={CX}
          cy={CY}
          r={110}
          fill="none"
          stroke="rgba(6, 182, 212, 0.18)"
          strokeWidth="1"
        />

        {/* Rotating decorative cyber rings directly hugging the central hub */}
        <g transform={`rotate(${((pulseTime * 24) % 360)} ${CX} ${CY})`}>
          <circle
            cx={CX}
            cy={CY}
            r={76}
            fill="none"
            stroke="#0df2a4"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.6"
          />
          {/* Orbital satellite photon beads around hub */}
          {[0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle
                key={`hub-bead-${deg}`}
                cx={CX + 76 * Math.cos(rad)}
                cy={CY + 76 * Math.sin(rad)}
                r={2}
                fill="#ffffff"
                filter="url(#particle-glow)"
              />
            );
          })}
        </g>

        {/* Counter-rotating fine micro-dash ring */}
        <g transform={`rotate(${(-((pulseTime * 16) % 360))} ${CX} ${CY})`}>
          <circle
            cx={CX}
            cy={CY}
            r={83}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.4"
          />
        </g>

        {/* Pulsing shockwaves rippling out from central circular hub */}
        <circle
          cx={CX}
          cy={CY}
          r={pulseR1}
          fill="none"
          stroke="#0df2a4"
          strokeWidth="1.5"
          opacity={pulseOpacity1}
        />
        <circle
          cx={CX}
          cy={CY}
          r={pulseR2}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.2"
          opacity={pulseOpacity2}
        />

        {/* Dynamic connecting lines from perimeter of circular hub to each moving node */}
        {nodePositions.map((node) => {
          const startX = CX + 72 * Math.cos(node.angle);
          const startY = CY + 72 * Math.sin(node.angle);
          const endX = node.x - 24 * Math.cos(node.angle);
          const endY = node.y - 24 * Math.sin(node.angle);
          const isCurrentActive = activeNodeId === node.id;

          return (
            <g key={`line-group-${node.id}`}>
              {/* Outer soft glow line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isCurrentActive ? node.accentColor : 'rgba(13, 242, 164, 0.45)'}
                strokeWidth={isCurrentActive ? 2.5 : 1.5}
                opacity={isCurrentActive ? 0.9 : 0.35}
              />
              {/* Core bright line */}
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#e0fdf4"
                strokeWidth={0.8}
                opacity={isCurrentActive ? 0.8 : 0.25}
              />
            </g>
          );
        })}

        {/* Traveling energy photon particles along the connecting lines */}
        {particles.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.px}
              cy={p.py}
              r={3}
              fill="#ffffff"
              opacity={p.opacity}
              filter="url(#particle-glow)"
            />
            <circle
              cx={p.px}
              cy={p.py}
              r={1.5}
              fill={p.color}
              opacity={p.opacity * 0.9}
            />
          </g>
        ))}
      </svg>

      {/* HTML Layer: Central Circular Hub Card with rich multi-layer animation */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
        style={{ width: '144px', height: '144px' }}
      >
        {/* Animated Outer Gradient Aura Ring */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#0df2a4]/40 via-cyan-400/20 to-[#0df2a4]/40 animate-hub-ring-spin blur-[2px] opacity-75 pointer-events-none" />

        {/* Main Circular Hub Container */}
        <div
          className="relative w-full h-full rounded-full bg-[#06121d]/95 backdrop-blur-md border-2 border-[#0df2a4] flex flex-col items-center justify-center text-center p-3 animate-hub-breathe overflow-hidden transition-all duration-300 hover:scale-105"
        >
          {/* Subtle internal radar/scanner sweep light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-25 animate-hub-radar"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, rgba(13, 242, 164, 0.45) 0deg, transparent 65deg, transparent 360deg)',
            }}
          />

          {/* Glowing Center Shield Icon Container (Circular with Heartbeat Pulse) */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 border-2 border-[#0df2a4] flex items-center justify-center text-[#0df2a4] mb-1 shadow-[0_0_16px_rgba(13,242,164,0.6)] animate-hub-heartbeat shrink-0">
            {/* Pulsing ripple ring */}
            <span className="absolute inset-0 rounded-full border border-[#0df2a4]/50 animate-ping opacity-60 pointer-events-none" />
            <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10" />
          </div>

          {/* Central Title */}
          <h4 className="text-xs sm:text-sm font-black text-white tracking-wide font-display leading-tight relative z-10">
            Seva<span className="text-[#0df2a4] drop-shadow-[0_0_8px_rgba(13,242,164,0.7)]">Connect</span>
          </h4>

          {/* Muted Subtitle */}
          <p className="text-[8.5px] sm:text-[9.5px] text-teal-200/90 font-medium leading-tight mt-0.5 relative z-10">
            Trusted Doorstep Network
          </p>

          {/* VERIFIED HUB Badge */}
          <div className="mt-1 flex items-center gap-1 relative z-10">
            <span className="text-[7.5px] sm:text-[8.5px] font-extrabold text-[#0df2a4] uppercase tracking-wider bg-[#0df2a4]/15 border border-[#0df2a4]/45 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(13,242,164,0.35)] animate-pulse">
              VERIFIED HUB
            </span>
          </div>
        </div>
      </div>

      {/* HTML Layer: 6 Service Category Nodes smoothly orbiting around the center */}
      {nodePositions.map((node) => {
        const IconComponent = node.icon;
        const isCurrentActive = activeNodeId === node.id;

        return (
          <div
            key={node.id}
            className="absolute z-30 transition-transform duration-75"
            style={{
              left: `${node.xPercent}%`,
              top: `${node.yPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              type="button"
              onClick={() => onSelectCategory?.(node.category)}
              onMouseEnter={() => setActiveNodeId(node.id)}
              onMouseLeave={() => setActiveNodeId(null)}
              className={`group flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl bg-[#06121d]/95 backdrop-blur-md border transition-all duration-200 cursor-pointer active:scale-95 ${
                isCurrentActive ? 'scale-110 z-40' : 'hover:scale-105'
              }`}
              style={{
                borderColor: isCurrentActive ? node.accentColor : node.borderColor,
                boxShadow: isCurrentActive
                  ? `0 0 22px ${node.glowColor}, inset 0 0 10px ${node.glowColor}`
                  : `0 0 14px ${node.glowColor}`,
              }}
              title={`Book ${node.name}`}
              aria-label={`Select ${node.name} service`}
            >
              {/* Service Icon Container */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${node.bgIconColor} ${
                  isCurrentActive ? 'scale-110' : ''
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>

              {/* Service Name */}
              <span
                className={`text-[9px] sm:text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                  isCurrentActive ? 'text-white' : node.textColor
                }`}
              >
                {node.name}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
