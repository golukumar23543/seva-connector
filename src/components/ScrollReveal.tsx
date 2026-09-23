import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  distance?: number; // Movement distance in pixels
  duration?: number; // Transition duration in milliseconds
  threshold?: number;
  glowOnReveal?: boolean;
  glowColor?: string;
  once?: boolean;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

/**
 * Performant scroll reveal wrapper utilizing native IntersectionObserver.
 * Hardware-accelerated CSS transforms and opacity.
 * Respects `prefers-reduced-motion`.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 650,
  threshold = 0.12,
  glowOnReveal = false,
  glowColor = 'rgba(13, 242, 164, 0.35)',
  once = true,
  style = {},
  as: Component = 'div',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const currentEl = elementRef.current;
    if (!currentEl) return;

    // Use responsive distance: slightly smaller on mobile to avoid overflow
    const isMobile = window.innerWidth < 640;
    const effectiveThreshold = isMobile ? Math.min(threshold, 0.08) : threshold;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold: effectiveThreshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, prefersReducedMotion]);

  // Compute transform based on direction
  const getInitialTransform = () => {
    if (prefersReducedMotion) return 'none';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const actualDistance = isMobile ? Math.min(distance, 14) : distance;

    switch (direction) {
      case 'up':
        return `translate3d(0, ${actualDistance}px, 0) scale(0.97)`;
      case 'down':
        return `translate3d(0, -${actualDistance}px, 0) scale(0.97)`;
      case 'left':
        return `translate3d(${actualDistance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${actualDistance}px, 0, 0)`;
      case 'scale':
        return 'scale(0.94)';
      case 'fade':
      default:
        return 'none';
    }
  };

  const transitionStyle: React.CSSProperties = prefersReducedMotion
    ? { opacity: 1, transform: 'none' }
    : {
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, box-shadow ${duration}ms ease ${delay}ms`,
        willChange: isRevealed ? 'auto' : 'transform, opacity',
        boxShadow:
          glowOnReveal && isRevealed
            ? `0 0 25px ${glowColor}`
            : undefined,
        ...style,
      };

  return (
    <Component
      ref={elementRef}
      className={className}
      style={transitionStyle}
    >
      {children}
    </Component>
  );
};
