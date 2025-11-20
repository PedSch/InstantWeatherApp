Responsive & Performance Checklist

This file lists steps taken and recommended next actions to make the app behave well on mobile and desktop, similar to large responsive apps.

What was implemented

- Added `viewport-fit=cover` and `theme-color` meta tags in `index.html` to support iOS safe areas and status bar coloring.
- Added a centralized Tailwind `container` configuration in `tailwind.config.js` and applied it to the header and main layout for consistent centered content.
- Improved `MapPreview.jsx` to compute appropriate map image sizes and provide a DPR-aware `srcset` plus `loading="lazy"` for improved mobile performance.
- Made core components more responsive:
  - `WeatherCard.jsx`: smaller padding and icons on narrow screens, responsive temp text size.
  - `SearchBar.jsx`: stacks vertically on small screens and makes the search button full-width on mobile.
  - `HourlyForecast.jsx`: reduces per-item min-width and padding on small screens to reduce horizontal scrolling.

Further recommendations

1) Image CDN + modern formats
- Use an image CDN (Cloudflare Images, Imgix, Akamai, S3 + CloudFront) to serve map/static images in WebP/AVIF where possible.
- Serve multiple resolutions with `srcset` and `sizes` for hero/large images.

2) Component design system
- Create a small design tokens file (spacing, font-sizes, breakpoints) and import/use across components.
- Convert repeated UI patterns (cards, buttons, headers) into small reusable components.

3) Performance budgets & automated checks
- Add Lighthouse CI or GitHub Actions that run Lighthouse and enforce budgets (e.g., LCP < 2.5s, TBT < 150ms, CLS < 0.1).
- Add image-size checks and a max asset size rule in CI.

4) Adaptive/SSR (optional)
- If using SSR (Vite SSR/Next.js), render different critical markup for mobile vs desktop to reduce initial payload for mobile users.
- Server-side detection or client hints can be used to selectively load heavy widgets.

5) Testing
- Test on real iOS/Android devices and use BrowserStack or similar for an automated device matrix.
- Use keyboard-only navigation and screen readers to validate accessibility.

How to test locally

- Dev server:

```bash
npm run dev
```

- Build:

```bash
npm run build
npm run preview
```

- Run tests:

```bash
npm test
```

If you want, I can:
- Add design tokens and a small `components/ui/` folder with standardized `Container`, `Card`, and `Button` components.
- Wire up Lighthouse CI configuration and a GitHub Action to run it on PRs.
- Migrate map images to an image CDN and add environment-driven config for the CDN base URL.

Environment-driven map / image CDN

- `VITE_MAP_PROVIDER_BASE` — optional. Override the default map provider base URL (defaults to Yandex static maps). Example:

  ```env
  VITE_MAP_PROVIDER_BASE=https://static-maps.yandex.ru/1.x/
  ```

- `VITE_IMAGE_CDN_BASE` — optional. If provided, `MapPreview` will proxy the map provider URL through the CDN by appending the provider URL as the `u` query parameter. Your CDN must support this pattern (e.g. `https://cdn.example/fetch?u=`).

Examples

```env
VITE_IMAGE_CDN_BASE=https://my-image-proxy.example/fetch?source=remote
VITE_MAP_PROVIDER_BASE=https://static-maps.yandex.ru/1.x/
```

Note: different CDNs have different expected URL formats. The current implementation assumes a query param (`u`) convention; change to match your CDN provider.

CSS tokens & local theming

- I added a small set of CSS variables in `src/styles.css` (spacing, radius, font sizes). You can edit these variables to change spacing and typography across the app. Example:

  ```css
  :root {
    --space-md: 16px;
    --radius-md: 12px;
  }
  ```

- A handful of components (cards) already use these variables — feel free to expand usage or migrate tokens to a theme provider.

Local Lighthouse + serve scripts

- I added npm scripts to run a local static server and Lighthouse: `npm run serve` and `npm run lighthouse`.
- The GitHub Action uses these scripts and the pinned devDependencies so Lighthouse is run as part of PR checks.
