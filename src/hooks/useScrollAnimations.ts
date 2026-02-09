"use client";

import { useEffect, useRef, useState } from "react";

interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = (
  options: AnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = "0px"
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref: elementRef, isVisible };
};

export const useStaggeredAnimation = (
  itemCount: number,
  baseDelay: number = 100,
  options: AnimationOptions = {}
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animation for each item
            for (let i = 0; i < itemCount; i++) {
              setTimeout(() => {
                setVisibleItems((prev) => new Set(prev).add(i));
              }, i * baseDelay);
            }
            observer.unobserve(container);
          }
        });
      },
      { threshold: options.threshold || 0.1 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [itemCount, baseDelay, options.threshold]);

  return { ref: containerRef, visibleItems };
};

// Animation classes for CSS
export const animationClasses = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-left {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fade-in-right {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fade-in-left 0.6s ease-out forwards;
  }

  .animate-fade-in-right {
    animation: fade-in-right 0.6s ease-out forwards;
  }

  .animate-scale-in {
    animation: scale-in 0.6s ease-out forwards;
  }

  .opacity-0 {
    opacity: 0;
  }

  .translate-y-8 {
    transform: translateY(2rem);
  }

  .translate-x-8 {
    transform: translateX(2rem);
  }

  .-translate-x-8 {
    transform: translateX(-2rem);
  }

  .scale-95 {
    transform: scale(0.95);
  }
`;