// src/hooks/useScrollReveal.js
// ---------------------------------------------------------------------------
// Scroll utilities: reveal-on-scroll + scroll progress.
// Usage:
//   const ref = useRef(null);
//   useScrollReveal(ref);            // observes [data-reveal] inside ref
//   const progress = useScrollProgress(); // 0 → 1
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

/**
 * Adds `.is-revealed` to every [data-reveal] element inside `rootRef`
 * the first time it enters the viewport.
 */
export function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef?.current;
    if (!root) return;

    const targets = root.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Fallback: no IO support or user prefers reduced motion → show everything.
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [rootRef]);
}

/**
 * Returns page scroll progress as a number between 0 and 1.
 * rAF-throttled, passive listeners.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}