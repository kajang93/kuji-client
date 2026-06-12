import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from './motion';
import { Loader2 } from './icons';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0 && window.scrollY === 0) {
        // Prevent default only when pulling down at the top
        if (e.cancelable) {
          e.preventDefault();
        }
        const newDistance = Math.min(distance * 0.4, PULL_THRESHOLD * 1.5);
        setPullDistance(newDistance);
        controls.set({ y: newDistance });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;
      setIsPulling(false);

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        controls.start({ y: 50 });
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          controls.start({ y: 0 });
          setPullDistance(0);
        }
      } else {
        controls.start({ y: 0 });
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance, onRefresh, controls]);

  return (
    <div ref={containerRef} className="relative min-h-full w-full">
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 h-16"
        initial={{ y: -64, opacity: 0 }}
        animate={{ 
          y: isRefreshing ? 0 : Math.min(0, pullDistance - 64),
          opacity: pullDistance > 20 || isRefreshing ? 1 : 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-lg">
          <Loader2 
            className={`w-6 h-6 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined 
            }}
          />
        </div>
      </motion.div>
      <motion.div animate={controls} className="min-h-full">
        {children}
      </motion.div>
    </div>
  );
};
