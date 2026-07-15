import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport it gets the class `revealed`.
 * Pass `stagger={true}` to also stagger direct children by their index.
 */
export function useReveal({ stagger = false, base = 80 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (stagger) {
            Array.from(el.children).forEach((child, i) => {
              child.style.transitionDelay = `${i * base}ms`;
              child.classList.add('revealed');
            });
          } else {
            el.classList.add('revealed');
          }
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, base]);

  return ref;
}