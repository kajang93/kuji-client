import { useEffect, useRef } from 'react';

type SwipeNavigationOptions = {
  onSwipeLeft?: () => void;  // Swipe left = go forward
  onSwipeRight?: () => void; // Swipe right = go back
  threshold?: number; // Minimum distance for swipe (in px)
};

export function useSwipeNavigation({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50 
}: SwipeNavigationOptions) {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diff = touchStartX.current - touchEndX.current;
      
      // Swipe left (forward)
      if (diff > threshold && onSwipeLeft) {
        onSwipeLeft();
      }
      
      // Swipe right (back)
      if (diff < -threshold && onSwipeRight) {
        onSwipeRight();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);
}
