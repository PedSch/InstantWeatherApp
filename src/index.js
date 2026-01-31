import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import { initSentry } from './initSentry'
import { registerServiceWorker } from './serviceWorkerRegistration'

// This is the app entrypoint. Vite will serve this module and mount
// the React tree into the `#root` element in `public/index.html`.
const container = document.getElementById('root')
const root = createRoot(container)

// Use `React.createElement` here to avoid relying on a JSX transform
// in `.js` files when building. This keeps the entrypoint compatible
// with environments that don't automatically convert JSX in `.js`.
root.render(React.createElement(App))

// Initialize Sentry if configured (Vite env `VITE_SENTRY_DSN`)
try {
	initSentry();
} catch (err) {
	// ignore
}

// Initialize Google Analytics 4 if configured
try {
	const gaId = import.meta.env.VITE_GA4_ID;
	if (gaId && typeof window !== 'undefined') {
		// Load GA4 script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		document.head.appendChild(script);
		
		// Initialize gtag
		window.dataLayer = window.dataLayer || [];
		function gtag(){window.dataLayer.push(arguments);}
		window.gtag = gtag;
		gtag('js', new Date());
		gtag('config', gaId, {
			send_page_view: true,
			anonymize_ip: true
		});
	}
} catch (err) {
	// ignore
}

// Register Service Worker in production contexts
if (import.meta.env.PROD) {
	try {
		registerServiceWorker();
	} catch (err) {
		// ignore
	}
}

// Global error overlay for easier debugging in the browser (DEV only; never in production)
if (import.meta.env.DEV) {
	;(function attachErrorOverlay() {
		try {
			const overlay = document.createElement('div')
			overlay.id = 'app-error-overlay'
			Object.assign(overlay.style, {
				position: 'fixed',
				left: '12px',
				right: '12px',
				top: '72px',
				padding: '12px',
				background: 'rgba(220,38,38,0.95)',
				color: 'white',
				zIndex: 99999,
				borderRadius: '8px',
				display: 'none',
				fontFamily: 'monospace',
				fontSize: '13px',
				maxHeight: '40vh',
				overflow: 'auto'
			})
			document.body.appendChild(overlay)

			function showError(msg) {
				overlay.textContent = msg
				overlay.style.display = 'block'
			}

			window.addEventListener('error', (ev) => {
				const msg = ev && ev.message ? ev.message : String(ev)
				const src = ev.filename ? `\n at ${ev.filename}:${ev.lineno}:${ev.colno}` : ''
				showError(msg + src)
			})

			window.addEventListener('unhandledrejection', (ev) => {
				const reason = ev && ev.reason ? ev.reason : String(ev)
				showError('UnhandledRejection: ' + reason)
			})

			const btn = document.createElement('button')
			btn.setAttribute('title', 'Reset App (clear SW/cache/local)')
			btn.textContent = '⟲'
			Object.assign(btn.style, {
				position: 'fixed',
				right: '8px',
				bottom: '8px',
				zIndex: 99999,
				width: '28px',
				height: '28px',
				padding: '0',
				borderRadius: '14px',
				background: '#111827',
				color: 'white',
				border: 'none',
				cursor: 'pointer',
				opacity: '0.28',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '14px'
			})
			btn.onmouseover = () => btn.style.opacity = '0.9'
			btn.onmouseout = () => btn.style.opacity = '0.28'
			btn.onclick = async () => {
				try {
					if ('serviceWorker' in navigator) {
						const regs = await navigator.serviceWorker.getRegistrations()
						await Promise.all(regs.map(r => r.unregister()))
					}
					if ('caches' in window) {
						const keys = await caches.keys()
						await Promise.all(keys.map(k => caches.delete(k)))
					}
					localStorage.removeItem('geo_prompted')
					location.reload()
				} catch (e) {
					console.warn('Reset failed:', e)
				}
			}
			document.body.appendChild(btn)
		} catch (e) {
			// ignore overlay errors
		}
	})()
}
