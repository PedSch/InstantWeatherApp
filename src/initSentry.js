// Lightweight Sentry initializer. Only load if `VITE_SENTRY_DSN` is set.
export function initSentry() {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return;

    // Use a runtime dynamic import executed via Function to avoid
    // Rollup/Vite statically resolving the module during build when
    // the package may not be installed in all environments.
    const dynamicImport = new Function('id', 'return import(id)')
    dynamicImport('@sentry/react').then(Sentry => {
      try {
        Sentry.init({
          dsn,
          integrations: [new Sentry.BrowserTracing()],
          tracesSampleRate: 0.05
        })
      } catch (e) {}
    }).catch(() => {
      // If the package is not present or import fails, silently continue.
    })
  } catch (err) {
    // ignore in environments that don't support import.meta or Function
  }
}
