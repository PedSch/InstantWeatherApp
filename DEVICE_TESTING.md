# Device Testing Checklist

## iOS Testing

### iPhone Safari
- [ ] **iPhone SE (2nd gen)** - 4.7" - smallest modern iPhone
  - [ ] Portrait mode layout
  - [ ] Safe area / notch handling
  - [ ] Location permission flow
  - [ ] Notification permission (shows iOS hint)
  - [ ] Theme toggle works
  - [ ] Search autocomplete
  - [ ] Saved locations drawer
  - [ ] Share functionality
  - [ ] PWA install prompt
  
- [ ] **iPhone 12/13/14** - 6.1" - most common size
  - [ ] All features above
  - [ ] Landscape orientation
  - [ ] Dynamic Island compatibility (14 Pro)
  
- [ ] **iPhone 14 Pro Max** - 6.7" - largest current iPhone
  - [ ] All features above
  - [ ] Utilizes larger screen space
  
### iPad Safari
- [ ] **iPad (9th gen)** - 10.2"
  - [ ] Responsive layout uses desktop view
  - [ ] Touch targets appropriate size
  - [ ] Landscape + portrait modes

### iOS Specific Tests
- [ ] Add to Home Screen works
- [ ] Offline mode with service worker
- [ ] Background fetch (if implemented)
- [ ] Haptic feedback (if implemented)
- [ ] Status bar color matches theme
- [ ] No horizontal scrolling
- [ ] Smooth 60fps animations
- [ ] Keyboard doesn't break layout

## Android Testing

### Chrome Android
- [ ] **Small phone** (< 5.5") - e.g., Pixel 4a
  - [ ] All core features work
  - [ ] No overflow/clipping
  - [ ] Theme toggle
  - [ ] Location permissions
  - [ ] Notification permissions
  
- [ ] **Medium phone** (6.0"-6.5") - e.g., Pixel 6
  - [ ] Standard responsive layout
  - [ ] All features functional
  
- [ ] **Large phone** (> 6.5") - e.g., Samsung Galaxy S22 Ultra
  - [ ] Utilizes screen space well
  - [ ] No awkward gaps

### Android Specific Tests
- [ ] Add to Home Screen
- [ ] Service worker / offline mode
- [ ] System theme detection (if enabled)
- [ ] Back button behavior
- [ ] Chrome custom tabs (if using)
- [ ] Battery optimization doesn't kill app

## Desktop Browsers

### Chrome/Edge Desktop
- [ ] **1920x1080** (Full HD - most common)
  - [ ] Layout centers properly
  - [ ] Max-width container works
  - [ ] No excessive whitespace
  
- [ ] **1366x768** (Laptop - still common)
  - [ ] Responsive breakpoints work
  - [ ] Sidebar visible on md+
  
- [ ] **2560x1440** (2K) and **3840x2160** (4K)
  - [ ] Content doesn't stretch too wide
  - [ ] Images scale appropriately

### Firefox Desktop
- [ ] All features work (especially notifications)
- [ ] Service worker registration
- [ ] CSS Grid/Flexbox compatibility

### Safari Desktop (macOS)
- [ ] All features functional
- [ ] Webkit-specific styling correct
- [ ] No layout bugs

## Cross-Browser Features

### Core Functionality
- [ ] City search works
- [ ] Geolocation permission flow
- [ ] Weather data displays correctly
- [ ] Hourly forecast scrolls smoothly
- [ ] Daily forecast grid responsive
- [ ] Map preview loads
- [ ] Unit toggle (°C/°F)
- [ ] Language toggle (EN/ES/CA/PT)
- [ ] Theme toggle (light/dark)
- [ ] Save/remove locations
- [ ] Share button functionality
- [ ] Notifications (browser/native)

### Performance
- [ ] Initial load < 3s on 3G
- [ ] Lighthouse score > 70 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth animations (60fps)
- [ ] Images lazy-load properly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (ARIA labels)
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Touch targets >= 44x44px

## Edge Cases

### Network
- [ ] Works on slow 3G
- [ ] Offline mode shows cached data
- [ ] Handles failed API requests gracefully
- [ ] Shows loading states
- [ ] Error messages are clear

### Data
- [ ] Handles cities with special characters
- [ ] Works with very long city names
- [ ] Handles no results gracefully
- [ ] Deals with API rate limits
- [ ] Max saved locations enforced (if any)

### UI States
- [ ] Empty states (no saved locations)
- [ ] Loading states (spinners)
- [ ] Error states (network fail)
- [ ] Success states (location saved)
- [ ] Very long text doesn't break layout

## Tools for Testing

### Remote Device Testing
- [ ] BrowserStack (paid, comprehensive)
- [ ] LambdaTest (freemium)
- [ ] Sauce Labs (enterprise)

### Local Testing
- [ ] Chrome DevTools device emulation
- [ ] Firefox Responsive Design Mode
- [ ] Safari Responsive Design Mode
- [ ] Real devices (borrow from friends/family)

### Automated Testing
- [ ] Playwright cross-browser tests
- [ ] Lighthouse CI in GitHub Actions
- [ ] Percy/Chromatic visual regression (optional)

## Deployment Environments

- [ ] **Development** - localhost:5173 works
- [ ] **Staging** - staging URL accessible, Sentry staging DSN
- [ ] **Production** - production URL, analytics enabled, Sentry production DSN

## Post-Launch Monitoring

- [ ] Sentry catches errors
- [ ] GA4 tracks page views
- [ ] Core Web Vitals monitored
- [ ] User feedback mechanism (if any)

## Notes
- Test with both WiFi and cellular data
- Test with different system font sizes
- Test with VoiceOver (iOS) / TalkBack (Android)
- Clear cache between tests
- Use private/incognito mode for clean tests
