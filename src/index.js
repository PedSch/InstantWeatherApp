import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// This is the app entrypoint. Vite will serve this module and mount
// the React tree into the `#root` element in `public/index.html`.
const container = document.getElementById('root')
const root = createRoot(container)

// Use `React.createElement` here to avoid relying on a JSX transform
// in `.js` files when building. This keeps the entrypoint compatible
// with environments that don't automatically convert JSX in `.js`.
root.render(React.createElement(App))
