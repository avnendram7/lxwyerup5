import { useEffect } from 'react';

/**
 * Locks body scroll when `isLocked` is true.
 * Uses the position:fixed technique for iOS Safari compatibility —
 * the body is fixed in place so it can't scroll, while the modal/sheet
 * does its own internal overflow scrolling.
 * The scroll position is preserved and restored on unlock.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;

    // iOS-compatible lock: fix the body at current scroll position
    document.body.style.overflow   = 'hidden';
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = '100%';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow   = '';
      document.body.style.position   = '';
      document.body.style.top        = '';
      document.body.style.width      = '';
      document.body.style.touchAction = '';
      // Restore scroll position without visual jump
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
