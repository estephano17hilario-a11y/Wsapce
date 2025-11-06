declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
  }
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.plausible === 'function') {
        window.plausible(event, props ? { props } : undefined);
        return;
      }
      if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture(event, props);
        return;
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      // Fallback logging in development to avoid breaking the app
      console.debug('[analytics]', event, props || {});
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[analytics:error]', event, err);
    }
  }
}