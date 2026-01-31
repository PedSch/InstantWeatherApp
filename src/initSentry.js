// Lightweight Sentry initializer. Only load if `VITE_SENTRY_DSN` is set.
export function initSentry() {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return;

    const environment = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
    const release = import.meta.env.VITE_APP_VERSION || 'unknown';

    // Use a runtime dynamic import executed via Function to avoid
    // Rollup/Vite statically resolving the module during build when
    // the package may not be installed in all environments.
    const dynamicImport = new Function('id', 'return import(id)')
    dynamicImport('@sentry/react').then(Sentry => {
      try {
        Sentry.init({
          dsn,
          environment,
          release,
          integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay({
              maskAllText: true,
              blockAllMedia: true,
            })
          ],
          tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.0,
          replaysOnErrorSampleRate: 1.0,
          beforeSend(event, hint) {
            // Filter out noise in development
            if (environment === 'development' && event.exception) {
              const error = hint.originalException;
              if (error && error.message && error.message.includes('ResizeObserver')) {
                return null; // ignore common dev noise
              }
            }
            return event;
          }
        })
        
        // Set user context if available
        const userId = localStorage.getItem('user_id');
        if (userId) {
          Sentry.setUser({ id: userId });
        }
      } catch (e) {
        console.warn('Sentry init failed:', e);
      }
    }).catch(() => {
      // If the package is not present or import fails, silently continue.
    })
  } catch (err) {
    // ignore in environments that don't support import.meta or Function
  }
}
