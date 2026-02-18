# Technology Stack

**Analysis Date:** 2026-02-04

## Languages

**Primary:**
- HTML5 - Page structure and canvas setup
- CSS3 - Styling, responsive layout, animations
- JavaScript (ES6) - Game logic, ~1942 lines

**Secondary:**
- None - No transpilation, no build process

## Runtime

**Environment:**
- Browser (Chrome, Firefox, Safari, Edge)
- iOS/iPad support (touch controls)

**Package Manager:**
- None - Zero dependencies, no npm/yarn/pnpm

**Build System:**
- None - Serve via HTTP server or open index.html directly

## Frameworks

**Core:**
- Vanilla HTML5 Canvas API - All rendering and game graphics
- Web Audio API - Procedural sound generation

**Testing:**
- None - No test framework

**Build/Dev:**
- None - No build tooling, no bundler, no transpiler

## Key APIs & Web Standards

**Critical:**
- Canvas 2D Context API - Game rendering
- Web Audio API (AudioContext) - Sound effects
- localStorage - High score persistence
- Fullscreen API - Fullscreen mode support
- Touch Events API - Mobile/iPad input handling
- Keyboard Events - Desktop input handling
- requestAnimationFrame - Game loop timing
- Image API - Sprite asset loading

## Configuration

**Environment:**
- No environment variables required
- No .env file needed
- Configuration hardcoded in `game.js`:
  - BASE_WIDTH: 1200
  - BASE_HEIGHT: 700
  - Level configurations (worldWidth, difficulty, etc.)

**Build:**
- No build configuration files
- No .gitignore (serve all files)
- No TypeScript or transpilation config

## Assets

**Location:** `assets/` directory

**Sprite Files:**
- `poppy1.png` through `poppy4.png` - Player walk animation
- `poppy_jump.png` - Optional jump sprite (graceful fallback if missing)
- `enemy1.png` through `enemy4.png` - Enemy animation frames
- `canon.png` - Cannon sprite

**Audio:**
- None - All sounds procedurally generated via Web Audio API

## Platform Requirements

**Development:**
- Any text editor (no IDE required)
- Python 3, Node.js http-server, or similar (optional HTTP server for reliable asset loading)
- Any modern browser

**Production:**
- Deployed as static files to any web server (GitHub Pages, Vercel, Netlify, etc.)
- No server-side processing
- No database required
- No build step required

## Browser Support

**Tested/Supported:**
- Modern browsers with Canvas, Web Audio API, and Touch Events support
- iOS Safari 13+
- Android Chrome

**Requirements:**
- HTML5 Canvas
- Web Audio API (with fallback handling for suspended contexts)
- localStorage
- Touch Events or Keyboard Events

## Performance Characteristics

**Game Loop:**
- requestAnimationFrame-based at ~60fps
- Fixed timestep physics using constants (gravity: 0.9, jumpForce: -24)
- Responsive canvas scaling based on viewport

**Memory:**
- Single canvas context, all entities stored in arrays
- Lazy audio initialization (first user interaction)
- Image preloading with graceful canvas fallbacks

## Deployment

**Current:**
- Static HTML/CSS/JS files
- Assets folder with PNG sprites
- Can be hosted on any static file server

**Build Command:**
- None required - serve directly

**Dependencies to Install:**
- None

---

*Stack analysis: 2026-02-04*
