// Performance optimization utilities

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param func The function to debounce.
 * @param wait The time in milliseconds to delay.
 * @returns A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once in a specified period.
 * @param func The function to throttle.
 * @param limit The time in milliseconds to throttle.
 * @returns A throttled version of the function.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return function (...args: Parameters<T>): void {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Memoize function to cache the results of expensive function calls.
 * @param func The function to memoize.
 * @returns A memoized version of the function.
 */
export function memoize<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Lazy load images to improve page load performance.
 * @param img The image element to lazy load.
 */
export function lazyLoadImage(img: HTMLImageElement): void {
  if ('loading' in HTMLImageElement.prototype) {
    img.loading = 'lazy';
  } else {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
    }
  }
}

/**
 * Preload critical resources to improve page load performance.
 * @param href The URL of the resource to preload.
 * @param as The type of resource (e.g., 'script', 'style', 'font').
 */
export function preloadResource(href: string, as: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}