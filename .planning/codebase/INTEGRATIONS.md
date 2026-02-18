# External Integrations

**Analysis Date:** 2026-02-04

## APIs & External Services

**Font Delivery:**
- Google Fonts - Patrick Hand font
  - URL: `https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap`
  - Location: `style.css` line 1
  - Fallback: Comic Sans MS, Chalkboard, system cursive fonts

**Game Services:**
- None - No analytics, ads, or backend services

## Data Storage

**Databases:**
- None - No backend database

**Client-Side Storage:**
- Browser localStorage only
  - Key: `poppiesHighScore`
  - Usage: Persist player high score across sessions
  - Access: `localStorage.getItem('poppiesHighScore')` and `localStorage.setItem('poppiesHighScore', score)`
  - Files: `game.js` lines 241, 677, 952

**File Storage:**
- Local filesystem (sprite assets)
  - Path: `assets/` directory
  - Files: PNG sprites for player, enemies, cannon
  - No cloud storage integration

**Caching:**
- Browser cache (static assets)
- No explicit cache management

## Authentication & Identity

**Auth Provider:**
- None - No user accounts, authentication, or login required

## Monitoring & Observability

**Error Tracking:**
- None - No error reporting service (Sentry, Rollbar, etc.)

**Logs:**
- None - No centralized logging
- Browser console only (development debugging)

**Analytics:**
- None - No Google Analytics, Mixpanel, or similar tracking

## CI/CD & Deployment

**Hosting:**
- Static file hosting (GitHub Pages, Vercel, Netlify, or custom web server)
- No server-side requirements

**CI Pipeline:**
- GitHub Actions workflow present: `.github/workflows/` (GitHub Pages deployment)
- No build step required
- No automated testing

**Deployment Target:**
- GitHub Pages (configured in workflows)
- Other static hosts supported (manual deployment)

## Environment Configuration

**Required env vars:**
- None - Application requires zero environment variables

**Secrets location:**
- None - No secrets, API keys, or credentials needed

**Offline Functionality:**
- Works offline once loaded
- Requires internet only for initial load of Google Fonts
- localStorage persists across browser restarts

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Web APIs Used (No External Services)

**Browser APIs Only:**
- Canvas 2D Context - Rendering
- Web Audio API - Sound synthesis
- localStorage - Data persistence
- Fullscreen API - Fullscreen mode
- Touch Events - Mobile input
- Keyboard Events - Desktop input
- requestAnimationFrame - Game loop timing
- Image API - Sprite loading

## Third-Party Code Dependencies

**Direct Dependencies:**
- None

**CDN Resources:**
- Google Fonts (Patrick Hand font) - Only external resource

**Polyfills:**
- None required - Uses modern browser APIs directly

**Feature Detection:**
- Web Audio API with webkit prefix fallback: `window.AudioContext || window.webkitAudioContext`
- Fullscreen API with webkit prefix support

## Cross-Origin (CORS)

**CORS Requirements:**
- Google Fonts request may require CORS (handled by Google)
- No other cross-origin requests

**Asset Loading:**
- Local relative paths (no cross-origin issues)
- Sprite assets load from `assets/` directory

## Data Flow to External Systems

**Score Persistence:**
- High score stays in localStorage (client-only)
- No transmission to any server or service

**No External Data Transmission:**
- Game state is never sent anywhere
- No telemetry, analytics, or backend synchronization
- Pure client-side game with zero server interaction

---

*Integration audit: 2026-02-04*
