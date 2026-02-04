# Codebase Structure

**Analysis Date:** 2026-02-04

## Directory Layout

```
C:\Users\bmoret\Desktop\Software\Poppies\
├── index.html           # HTML document with canvas element, UI, touch buttons
├── style.css            # All styling (responsive layout, theme, touch controls)
├── game.js              # All game logic (~1375 lines, no dependencies)
├── assets/              # Optional: sprite image files (not present, uses fallbacks)
├── .git/                # Git repository metadata
├── CLAUDE.md            # Project development guidelines
└── .planning/
    └── codebase/        # GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md)
```

## Directory Purposes

**Project Root:**
- Purpose: Minimal, single-page game - all application code in three main files
- Contains: HTML, CSS, JavaScript; no build output or dependencies
- Key files: `index.html`, `style.css`, `game.js`

**assets/ (Optional):**
- Purpose: Optional sprite images for player walk cycle, enemy, cannon
- Contains: PNG files
  - `poppy1.png`, `poppy2.png`, `poppy3.png`, `poppy4.png` (player walk frames)
  - `poppy_jump.png` (player jump frame)
  - `enemy1.png`, `enemy2.png`, `enemy3.png`, `enemy4.png` (enemy walk frames)
  - `canon.png` (cannon sprite)
- Generated: No
- Committed: No (directory not present in repository)
- Fallback behavior: If any sprite fails to load, game uses procedurally drawn fallback shapes

## Key File Locations

**Entry Points:**

- `C:\Users\bmoret\Desktop\Software\Poppies\index.html`: HTML document
  - Defines canvas element (`#gameCanvas`)
  - Defines UI: title, score/level display, control instructions, buttons
  - Defines touch control buttons (fixed-position overlays)
  - Loads `game.js` script (which auto-runs on load)

**Configuration:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (top section, lines 1-60):
  - Canvas element references and 2D context
  - Base resolution constants: `BASE_WIDTH = 1200`, `BASE_HEIGHT = 700`
  - Image asset loading and fallback initialization

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 248-252):
  - `levelConfig` object: difficulty parameters for 3 levels
  - Controls world width, enemy/platform behavior, cannon placement

**Core Logic:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 256-280): Player object definition
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 287-293): Entity array declarations
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 295-487): `generateWorld()` - procedural level generation
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 619-670): Game state transitions (`startGame()`, `nextLevel()`, `gameOver()`)

**Physics & Collision:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 690-958): `update()` - physics simulation and collision resolution
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 960-973): `checkCollision()` and `checkCoinCollision()` - AABB collision detection

**Rendering:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1013-1110): `drawBackground()` - parallax sky, clouds, sun, sea
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1112-1202): `drawPlatform()` - floor and floating platforms with doodle style
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1204-1274): `drawPlayer()` - player character with animation/sprite fallback
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1276-1345): `drawEnemy()` - enemy character with animation/sprite fallback
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1347-1374): `drawDebris()` - particle effects from broken platforms
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1376-1410): `drawCoin()` - collectible coins with bounce animation
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1412-1447): `drawCannon()` - cannon sprites/fallback
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1449-1475): `drawCannonball()` - projectiles
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1477-1562): `drawFlag()` - level goal with pirate flag
- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1564-1800): Screen overlays (`drawStartScreen()`, `drawLevelComplete()`, `drawGameWon()`, `drawGameOver()`)

**Audio:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 92-233): Audio system
  - `initAudio()` (lines 95-102): Lazy-initialize Web Audio API
  - `playJumpSound()` (lines 105-125): Jump sound
  - `playCoinSound()` (lines 128-147): Coin collection sound
  - `playEnemyDefeatSound()` (lines 150-169): Enemy defeated sound
  - `playGameOverSound()` (lines 172-191): Game over sound
  - `playBreakSound()` (lines 194-213): Platform break sound
  - `playLevelCompleteSound()` (lines 216-233): Level completion melody

**Input:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 492-595): Input system
  - Keyboard event listeners (lines 494-511): Arrow keys, WASD, Space
  - Touch button handlers (lines 517-562): iPad/tablet button elements
  - Canvas touch fallback (lines 565-595): Legacy touch support

**Game Loop:**

- `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1927-1931): Main game loop
  - Calls `update()` then `draw()` each frame
  - Uses `requestAnimationFrame` for 60 FPS target

**Styling:**

- `C:\Users\bmoret\Desktop\Software\Poppies\style.css` (lines 1-70): Base styles and layout (centering, canvas sizing)
- `C:\Users\bmoret\Desktop\Software\Poppies\style.css` (lines 71-162): Title, header, score display, button styling
- `C:\Users\bmoret\Desktop\Software\Poppies\style.css` (lines 164-229): Fullscreen mode handling
- `C:\Users\bmoret\Desktop\Software\Poppies\style.css` (lines 231-303): Touch control buttons (fixed overlay positioning, media query)

## Naming Conventions

**Files:**

- `index.html`: Standard HTML entry point
- `style.css`: Monolithic stylesheet (no CSS-in-JS or modular CSS)
- `game.js`: Monolithic game script (~1375 lines)
- Asset files: Snake case with number suffix (`poppy1.png`, `poppy_jump.png`, `enemy1.png`, `canon.png`)

**Functions:**

- Prefix `draw*()`: All rendering functions (e.g., `drawBackground`, `drawPlayer`, `drawCoin`)
- Prefix `play*Sound()`: All audio functions (e.g., `playJumpSound`, `playCoinSound`)
- Prefix `check*()`: Collision detection (e.g., `checkCollision`, `checkCoinCollision`)
- No prefix: Game state management functions (`startGame`, `gameOver`, `nextLevel`, `restartGame`)
- Verb-noun: `update()`, `draw()`, `generateWorld()`, `initAudio()`

**Variables:**

- camelCase: `gameRunning`, `currentLevel`, `cameraX`, `velocityX`, `walkFrame`
- UPPERCASE: Constants (`BASE_WIDTH`, `BASE_HEIGHT`, `SCREEN_CENTER`)
- Descriptive: `breakable`, `grounded`, `doingSalto`, `levelComplete`

**Objects/Arrays:**

- camelCase singular for entity definitions (`player`, `flag`)
- camelCase plural for collections (`platforms`, `enemies`, `coins`, `debris`, `cannons`, `cannonballs`)

**Types:**

- No TypeScript; all values are plain JavaScript objects and primitives
- Entity objects have consistent structure: `{ x, y, width, height, ... }`
- Collision box properties always at top level (no nested bounding box)

## Where to Add New Code

**New Game Feature (e.g., power-up, new enemy type):**

1. **Definition:** Add to entity arrays declaration section (lines 287-293)
   - Example: `let powerups = [];`

2. **Generation:** Add spawning logic to `generateWorld()` function (lines 295-487)
   - Example: Add powerup placement loop after coin generation

3. **Update Logic:** Add update code to `update()` function (lines 690-958)
   - Example: Update position, check collisions with player

4. **Rendering:** Create new `draw[Feature]()` function matching pattern in lines 1013-1562
   - Call from main `draw()` function (lines 1887-1925) in appropriate layer order

5. **Sound (if applicable):** Create `play[Feature]Sound()` function (lines 92-233) using Web Audio API pattern
   - Call from `update()` when feature activates

6. **Difficulty Scaling:** Add parameters to `levelConfig` (lines 248-252) if behavior varies by level

**New Component/Module:**

Game uses single-file architecture; new components cannot be isolated. To add functionality:

1. Add helper functions in relevant section before use
2. Group related functions together (e.g., all drawing functions in 976-1800 range)
3. Follow existing naming convention (`draw*`, `play*`, `check*`)
4. Reference state from top-level variables (player, platforms, enemies, etc.)

**Utilities/Helper Functions:**

- **Rendering Helpers:** `doodleRect()`, `doodleCircle()`, `seededRandom()`, `getScale()` (lines 979-1011)
  - Pattern: Pure functions that operate on canvas context
  - Location: Keep in rendering section (lines 976-1011)

- **Math/Physics Constants:** Define at module level with UPPERCASE names (e.g., `BASE_WIDTH`, `SCREEN_CENTER`)

- **Configuration:** Add lookup tables near top of file (e.g., `levelConfig`)

## Special Directories

**assets/ (Optional):**
- Purpose: Image assets for sprites
- Generated: No
- Committed: No (not present in repository)
- Fallback: All missing sprites have procedural canvas-drawn alternatives
- If creating: Place PNG files directly in `assets/` with naming pattern matching lines 41-88

**.planning/codebase/ (GSD Only):**
- Purpose: Analysis documents generated by GSD tools
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Typically yes, to share architecture documentation
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md (depending on focus)

## Code Organization Principles

**Monolithic Single-File Design:**
- All 1375 lines of game code in `game.js`
- No modules or imports (no build process, no dependencies)
- Functions organized by system: initialization → constants → assets → audio → state → entities → input → game functions → collision → rendering → game loop

**State Centrality:**
- All game state stored in module-level variables (`player`, `platforms`, `enemies`, `coins`, etc.)
- No class instances or encapsulation
- Direct mutation of entity objects in `update()` function

**Rendering Order (Depth):**
- Background (parallax sky/sea)
- Platforms
- Debris particles
- Coins
- Cannons and cannonballs
- Flag
- Enemies
- Player (always on top)
- UI overlays (semi-transparent full-screen)

**Responsive Design:**
- All coordinates in logical 1200x700 space
- Multiply by `getScale()` during render phase
- Canvas resized on window resize and fullscreen events
- Touch controls only visible on touch devices (CSS media query)

---

*Structure analysis: 2026-02-04*
