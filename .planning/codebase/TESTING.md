# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Status:** No testing framework detected.

- No test runner installed (Jest, Vitest, Mocha, etc.)
- No test configuration files present (`jest.config.js`, `vitest.config.ts`, etc.)
- No test scripts in package.json (no package.json present)
- No `.test.js` or `.spec.js` files in codebase
- No assertion library (Chai, expect.js, Node's assert module, etc.)

**Manual Testing Approach:**
Game validation occurs through browser execution only. No automated tests.

## Test File Organization

**Not applicable:** No test files exist.

**Manual validation approach:**
- Open `index.html` in browser with `python -m http.server 8000` or direct file access
- Play through game levels to verify mechanics
- Test on multiple devices (desktop, tablet, mobile) for touch control validation

## Test Structure

**No test suites implemented.** Game is validated through:

1. **In-browser manual testing** - Play game and observe behavior
2. **Cross-device testing** - iPad/tablet touch controls, keyboard on desktop
3. **Console observation** - Check browser console for errors during gameplay

**Areas requiring manual validation:**

**Physics & Collision:**
- Player jump height and timing (jumpForce: -24, gravity: 0.9)
- Platform collision detection (AABB in `checkCollision()`)
- Enemy defeat detection (must land on top of enemy)
- Coin collection (30px radius check in `checkCoinCollision()`)
- Cannonball collision (instant game over)

**Gameplay Mechanics:**
- Salto animation trigger (25% chance on jump)
- Platform breaking (head-bump from below, spawns 6 debris particles)
- Enemy patrol (moveRange validation)
- Level progression (3 levels total, increasing difficulty)
- Score calculation (coins: 50, enemies: 100, breakable platforms: 25)

**Audio:**
- Lazy initialization on first user interaction
- Five distinct sound effects should play: jump, coin, enemy defeat, game over, platform break
- Web Audio API synthesis works without audio files

**Input:**
- Keyboard: Arrow keys or WASD or Space
- Touch: Canvas thirds (left/right/center) or dedicated buttons on iPad
- Both input methods work simultaneously

**Rendering:**
- Canvas scales responsively to window size
- Doodle hand-drawn visual style consistent across platforms
- Parallax background scrolling smooth
- All sprites render with proper scaling via `getScale()`

## Mocking

**Not applicable:** No mocking framework or mocking patterns present.

**Natural testing limitations:**

1. **Image loading** - Assets are optional and have canvas fallbacks
   - Missing `assets/poppy1.png` falls back to drawn ellipse
   - Missing enemy sprites fall back to red-tinted player sprite
   - Missing cannon sprite falls back to drawn rectangle

2. **Audio context** - Gracefully degrades if Web Audio API unavailable
   - `initAudio()` returns silently if AudioContext creation fails
   - All sound functions check `if (!audioContext) return;`

3. **LocalStorage** - High score persists or starts at 0
   - `localStorage.getItem('poppiesHighScore') || 0`
   - Game works identically with or without storage access

**Testing approach for dependencies:**
Rename/delete asset files to test fallback rendering. Disable JavaScript Web Audio API support to test audio handling.

## Fixtures and Factories

**Not applicable:** No test fixtures or factory patterns.

**Hard-coded test state available:**

**Level Configuration** (at `game.js` line 248-252):
```javascript
const levelConfig = {
    1: { worldWidth: 5000, gapChance: 0.20, breakableChance: 0.25, enemySpacing: 500, enemySpeed: 1.5, cannonCount: 0, cannonFireRate: 0 },
    2: { worldWidth: 6500, gapChance: 0.30, breakableChance: 0.35, enemySpacing: 400, enemySpeed: 2.5, cannonCount: 3, cannonFireRate: 180 },
    3: { worldWidth: 8000, gapChance: 0.40, breakableChance: 0.45, enemySpacing: 300, enemySpeed: 3.5, cannonCount: 5, cannonFireRate: 140 }
};
```

To test specific scenarios, these values can be modified before page load:
- Level 2 requires cannonCount > 0 and fireRate timing
- Level 3 is hardest with highest gapChance and breakableChance
- Platform properties: `{ x, y, width, height, type, breakable, broken }`
- Enemy properties: `{ x, y, width, height, baseX, moveRange, speed, direction, platformY }`

**Player initialization** (at `game.js` line 257-280):
```javascript
const player = {
    x: 100,
    y: 400,
    width: 60,        // Collision box
    height: 100,      // Collision box
    drawWidth: 120,   // Grotere tekening
    drawHeight: 170,
    velocityX: 0,
    velocityY: 0,
    speed: 6,
    jumpForce: -24,
    gravity: 0.9,
    // ...
};
```

These values control core physics and can be modified to test jump height, gravity, movement speed.

## Coverage

**Requirements:** No coverage targets enforced.

**Coverage status:** 0% - No tests exist.

**Critical untested paths:**
- Collision detection edge cases (corners, moving collisions)
- Enemy spawning validation (placement on stable platforms only)
- Breakable platform destruction (debris spawn count and physics)
- Level generation randomness (gap creation, enemy placement)
- Audio synthesis (frequency modulation, envelope)
- Save/load high score persistence
- Touch control on various device sizes
- Canvas resize behavior in fullscreen

**Viewable via:**
No coverage tooling available.

## Test Types

**Unit Tests:** Not used.

**Integration Tests:** Not used.

**E2E Tests:** Not used.

**Manual E2E Validation:**

Start at `index.html`, play through full game flow:

1. **Startup Flow:**
   - Page loads, title screen displays
   - Press Space to start game
   - Level 1 begins, initial platform and enemy placement visible

2. **Gameplay Flow:**
   - Arrow keys/WASD move player left/right
   - Space jumps, velocity reacts correctly
   - Collide with platforms, detect grounded state
   - Collect coins (score increases by 50)
   - Jump on enemies (score increases by 100, enemy disappears)
   - Jump under breakable platforms (platform breaks, debris spawns, score increases by 25)

3. **Hazards:**
   - Fall through gap below floor → Game Over
   - Get hit by enemy → Game Over
   - Get hit by cannonball (Level 2+) → Game Over

4. **Level Progression:**
   - Reach flag at end of level → Level Complete screen
   - Level 1 has 0 cannons, Level 2 has 3, Level 3 has 5
   - Enemy speed increases each level
   - Gap frequency increases each level

5. **Victory:**
   - Complete Level 3 → Victory screen with trophy
   - Show total score and new record notification if applicable
   - Press Space to restart

6. **Audio:**
   - First interaction triggers audio context init
   - Jump makes sound (pitch sweep)
   - Coin collection makes sound (square wave arpeggio)
   - Enemy defeat makes sound (sawtooth sweep)
   - Platform break makes sound (triangle sweep)
   - Level complete plays 4-note melody
   - Game over plays descending tone

7. **Touch Controls (iPad/Tablet):**
   - Left third of canvas: move left
   - Right third of canvas: move right
   - Center third of canvas: jump
   - Or use on-screen buttons (left/right/jump) if visible
   - All controls work while holding multiple touches

8. **Responsive Behavior:**
   - Window resize: canvas scales maintaining aspect ratio
   - Enter fullscreen: 95vw x 80vh maximum with proper fit
   - All UI elements (buttons, score display) responsive

## Common Patterns

**Async Testing:** Not applicable - no async operations (no API calls, no promises).

**All operations are synchronous:**
- Image loading: Non-blocking via `img.onload` callbacks, but game doesn't wait
- Web Audio API: Synchronous after lazy init
- LocalStorage: Synchronous
- Game loop: Synchronous via `requestAnimationFrame()`

**Error Testing:** Not structured as formal tests.

**Fallback validation through code inspection:**
- Missing image: `if (playerImageLoaded)` check at line 1222
- No audio context: `if (!audioContext) return;` at line 107
- Broken platform skip: `if (platform.broken) return;` at line 787
- Optional sprite frames: `if (walkFramesLoaded >= walkFrameCount)` at line 1247

**Physical World Testing:**

Manually adjust constants to test physics:
- Change `jumpForce: -24` to `-20` for lower jumps or `-28` for higher jumps
- Change `gravity: 0.9` to `1.2` for faster falling or `0.6` for floatier feel
- Change `speed: 6` to `3` for slower movement or `10` for faster
- Observe how platforming difficulty changes with these values

**Procedural Generation Testing:**

Modify level config to test world generation edge cases:
```javascript
const levelConfig = {
    1: {
        worldWidth: 2000,        // Smaller for testing
        gapChance: 0.5,          // More gaps
        breakableChance: 0.8,    // More breakable platforms
        enemySpacing: 200,       // More enemies
        enemySpeed: 5,           // Faster enemies
        cannonCount: 2,          // Test cannons
        cannonFireRate: 60       // Faster firing
    }
};
```

Play through to observe world generation behavior, collision edge cases, enemy placement logic.

---

*Testing analysis: 2026-02-04*
