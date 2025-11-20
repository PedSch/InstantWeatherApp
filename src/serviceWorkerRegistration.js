// Register the service worker from `/service-worker.js` in production builds.
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Wait until the page is interactive to avoid delaying first paint
    const onReady = () => {
      navigator.serviceWorker.register('/service-worker.js').then(reg => {
        // Registration succeeded
      }).catch(err => {
        // Registration failed silently
        // console.warn('ServiceWorker registration failed', err)
      });
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      onReady();
    } else {
      window.addEventListener('DOMContentLoaded', onReady, { once: true });
    }
  }
}
