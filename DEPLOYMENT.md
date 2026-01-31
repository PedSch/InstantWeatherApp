# Deployment Guide

## Prerequisites

1. **Environment Variables**: Do **not** commit `.env`, `.env.local`, `.env.production`, or `.env.staging`. Use the example files as templates:
   - Development: copy `.env.example` to `.env.local` and fill in your values
   - Staging: copy `.env.staging.example` to `.env.staging` (or set vars in CI)
   - Production: copy `.env.production.example` to `.env.production` (or set vars in Vercel/CI)
2. **Sentry Account**: Sign up at https://sentry.io/ and get your DSN
3. **Google Analytics**: Create a GA4 property at https://analytics.google.com/
4. **Node.js**: Ensure Node.js 18+ is installed

## Building for Different Environments

### Development
```bash
npm run dev
```
Runs local dev server at http://localhost:5173. Uses `.env.local` if present, else `.env.example` defaults.

### Staging
```bash
npm run build:staging
```
Builds with staging config: set env vars in CI or use a local `.env.staging` (from `.env.staging.example`). Do not commit `.env.staging`.

### Production
```bash
npm run build:production
```
Builds with production config: set env vars in Vercel/CI or use a local `.env.production` (from `.env.production.example`). Do not commit `.env.production`.

## Deployment Platforms

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SENTRY_DSN`
   - `VITE_GA4_ID`
   - `VITE_ENV=production`
   - `VITE_APP_VERSION=1.0.0`

### Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard

### GitHub Pages

Add to `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:production
        env:
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
          VITE_GA4_ID: ${{ secrets.VITE_GA4_ID }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Mobile App Deployment

### iOS App Store

1. Build iOS app:
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

2. In Xcode:
   - Set bundle identifier
   - Configure signing & capabilities
   - Archive and upload to App Store Connect

### Google Play Store

1. Build Android app:
```bash
npx cap add android
npx cap sync android
npx cap open android
```

2. In Android Studio:
   - Update package name in `build.gradle`
   - Generate signed APK/AAB
   - Upload to Google Play Console

## Post-Deployment Checklist

- [ ] Verify Sentry is receiving events
- [ ] Check GA4 real-time reports
- [ ] Test all features in production
- [ ] Run Lighthouse audit
- [ ] Check mobile responsiveness
- [ ] Verify PWA install works
- [ ] Test offline functionality
- [ ] Monitor error rates in Sentry
- [ ] Check Core Web Vitals in GA4

## Monitoring

### Sentry Dashboard
- Monitor error rates
- Set up alerts for critical errors
- Review performance metrics

### Google Analytics
- Track user engagement
- Monitor Core Web Vitals
- Analyze user flows

### Lighthouse CI
- Automated in GitHub Actions
- Runs on every PR
- Enforces performance budgets

## Rollback Procedure

### Vercel
```bash
vercel rollback
```

### Netlify
Use Netlify dashboard to revert to previous deployment

### Manual
```bash
git revert <commit-hash>
git push
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_GA4_ID` | No | Google Analytics 4 Measurement ID |
| `VITE_ENV` | No | Environment name (development/staging/production) |
| `VITE_APP_VERSION` | No | App version for Sentry releases |
| `VITE_MAP_PROVIDER_BASE` | No | Custom map provider URL (default: Yandex static maps; set in production if you prefer another provider or key-based service) |
| `VITE_IMAGE_CDN_BASE` | No | Image CDN base URL |

## Troubleshooting

### Build fails
- Check Node.js version (18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for environment variable issues

### Sentry not working
- Verify DSN is correct
- Check environment is set properly
- Ensure @sentry/react is installed

### Analytics not tracking
- Verify GA4 Measurement ID
- Check browser ad blockers
- Look for console errors

### PWA not installing
- Ensure HTTPS (required for service workers)
- Check `manifest.json` is accessible
- Verify service worker registration

## Support

For deployment issues, check:
- [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html)
- [Capacitor docs](https://capacitorjs.com/docs)
- Project GitHub issues
