# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Single-page game loop architecture with procedural world generation and decoupled entity systems.

**Key Characteristics:**
- `requestAnimationFrame`-based game loop calling `update()` then `draw()` each frame
- Procedurally generated 5000-8000px wide levels with floor segments, floating platforms, and enemies
- Plain JavaScript objects (no classes) for all game entities
- Canvas-based 2D rendering with hand-drawn visual style via seeded randomization
- Responsive rendering that scales to viewport while maintaining 1200x700 logical resolution
- Web Audio API for procedurally generated sound effects

## Layers

**Presentation/Rendering:**
- Purpose: Draw all game entities and UI to canvas with hand-drawn cartoon aesthetic
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 976-1925, `draw*` functions)
- Contains: Background parallax, platforms, player character, enemies, coins, debris, cannons, UI overlays
- Depends on: Canvas context, entity state, camera position, scale calculations
- Used by: Game loop calls `draw()` every frame

**Update/Game Logic:**
- Purpose: Update entity positions, handle collisions, manage state transitions
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 690-958, `update()` function)
- Contains: Physics (gravity, velocity), collision detection, enemy AI, coin/cannon mechanics
- Depends on: Input state (keys, touch), entity objects, collision helpers
- Used by: Game loop calls `update()` before each render

**Input System:**
- Purpose: Capture keyboard and touch input, map to game actions
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 492-595)
- Contains: Keyboard listeners (arrow keys, WASD, Space), touch button handlers, canvas touch zones
- Depends on: DOM elements (buttons, canvas), key/touch event listeners
- Used by: `update()` reads `keys` and `touchLeft`/`touchRight` flags

**World Generation:**
- Purpose: Procedurally create level layout with platforms, enemies, coins, cannons
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 295-487, `generateWorld()`)
- Contains: Floor segment generation with gaps, floating platform placement, enemy spawning logic, coin pattern generation, cannon placement
- Depends on: Level configuration (`levelConfig`), random number generation
- Used by: Called when starting game and advancing to next level

**Audio System:**
- Purpose: Generate and play synthesized sound effects via Web Audio API
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 92-233, `play*Sound()` functions)
- Contains: Five synthesized sounds (jump, coin, enemy defeat, game over, break sound, level complete)
- Depends on: Web Audio API, lazy initialization on first user interaction
- Used by: Called during collision events and game state changes

**State Management:**
- Purpose: Track game flow state, score, level progression, persistence
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 236-252)
- Contains: `gameRunning`, `gameStarted`, `score`, `currentLevel`, `levelComplete`, `gameWon`, `highScore` (persisted to localStorage)
- Depends on: None (independent state container)
- Used by: Every system reads/writes to these variables

## Data Flow

**Per-Frame Update Cycle:**

1. **Input Capture** (keyboard/touch listeners)
   - Sets `keys.left`, `keys.right`, `keys.jump` flags
   - Sets `touchLeft`, `touchRight` flags

2. **Physics Update** (`update()` function)
   - Apply gravity to player velocity
   - Move player horizontally based on input
   - Resolve horizontal collisions with platforms
   - Move player vertically
   - Resolve vertical collisions with platforms (landing, under-bumping)
   - Update animation frames

3. **Entity Updates**
   - Update enemy patrol positions and walk animations
   - Update debris physics and decay
   - Fire cannons and move cannonballs
   - Check coin/enemy/flag collisions

4. **Camera Update**
   - Position camera to follow player (centered on screen)
   - Clamp camera to world bounds

5. **Rendering** (`draw()` function)
   - Clear canvas
   - Draw parallax background (sky, clouds, sun, sea)
   - Draw platforms (ordered by depth)
   - Draw particles (debris)
   - Draw coins
   - Draw cannons and cannonballs
   - Draw flag
   - Draw enemies
   - Draw player (on top)
   - Draw UI overlays (start screen, level complete, game over, game won)

6. **Next Frame**
   - `requestAnimationFrame` queues next cycle

**State Management:**

Game state flows through these transitions:

```
Initial (no state)
    ↓
gameStarted=false → Start Screen displayed
    ↓
User presses Space/Jump → gameStarted=true, gameRunning=true
    ↓
Player playing → update() and draw() run
    ↓
Player falls/hit enemy → gameRunning=false → Game Over screen
    ↓
User presses Space → restartGame() → back to level start
    ↓
Player reaches flag → levelComplete=true, gameRunning=false → Level Complete screen
    ↓
User presses Space → nextLevel() → increment currentLevel, gameRunning=true
    ↓
currentLevel >= 3 → gameWon=true → Game Won screen
    ↓
User presses Space → restartGame() → back to level 1
```

## Key Abstractions

**Player Object:**
- Purpose: Represent player character with position, velocity, collision box, animation state
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 257-280)
- Pattern: Plain object with properties (x, y, velocityX, velocityY, rotation, walkFrame, etc.)
- Updated by: `update()` function
- Rendered by: `drawPlayer()` function

**Entity Objects (Platforms, Enemies, Coins, Debris, Cannons):**
- Purpose: Represent discrete game elements with position, dimensions, and type-specific properties
- Location: Stored in arrays: `platforms`, `enemies`, `coins`, `debris`, `cannons`, `cannonballs`
- Pattern: Plain objects with collision box (x, y, width, height) and entity-specific state
- Examples:
  - `platforms`: `{ x, y, width, height, type, breakable, broken }`
  - `enemies`: `{ x, y, width, height, baseX, moveRange, speed, direction, walkFrame }`
  - `coins`: `{ x, y, collected }`
  - `debris`: `{ x, y, vx, vy, size, rotation, rotationSpeed, life }`

**Level Configuration:**
- Purpose: Define difficulty scaling across 3 levels
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 248-252)
- Pattern: Lookup table `levelConfig[level]` with parameters controlling generation and entity behavior
- Controls: world width, gap/breakable chance, enemy spacing/speed, cannon count/fire rate

## Entry Points

**Game Initialization:**
- Location: `C:\Users\bmoret\Desktop\Software\Poppies\game.js` (lines 1936-1942)
- Triggers: Page load (auto-executes at end of script)
- Responsibilities:
  - Get canvas and context references
  - Call `resizeCanvas()` to set initial dimensions
  - Initialize score display
  - Call `gameLoop()` to start requestAnimationFrame cycle

**Game Start:**
- Location: `startGame()` function (lines 619-643)
- Triggers: Player presses Space/Jump when `gameStarted=false` or when entering from menu screens
- Responsibilities:
  - Initialize audio context (lazy load)
  - Reset player position and velocity
  - Reset game state (score, level, flags)
  - Call `generateWorld()` to create level

**Next Level:**
- Location: `nextLevel()` function (lines 649-670)
- Triggers: Player reaches flag when `currentLevel < 3`
- Responsibilities:
  - Increment `currentLevel`
  - Reset player position
  - Call `generateWorld()` with new level config
  - Preserve score across levels

**Game Over/Restart:**
- Location: `gameOver()` function (lines 672-680) and `restartGame()` (lines 645-647)
- Triggers: Player falls or collides with enemy; user presses Space on game over screen
- Responsibilities: Pause update loop, save high score to localStorage, show restart button

## Error Handling

**Strategy:** Graceful degradation with fallback rendering.

**Patterns:**

- **Missing Assets:** If sprite images fail to load, fallback to procedurally drawn shapes (colored ellipses for player/enemies, wooden rectangles for platforms)
  - Player: Lines 1222-1274 check `playerImageLoaded`, `walkFramesLoaded`, `jumpImageLoaded`; fallback to animated cyan ellipse
  - Enemies: Lines 1308-1342 check `enemyWalkFramesLoaded`; fallback to red-tinted player image or animated circle with eyes
  - Platforms: Always drawn procedurally with doodle style (no image dependency)

- **Web Audio Failure:** Each `play*Sound()` function checks if `audioContext` is initialized and returns silently if not available
  - Lines 95-102: `initAudio()` safely initializes or resumes audio context
  - Each sound function checks `if (!audioContext) return;` before attempting to create oscillators

- **Canvas/DOM Not Available:** Not explicitly handled; relies on browser providing canvas element named `gameCanvas`

- **Collision Overflow:** Physics uses fixed constants; collisions are resolved per-axis to prevent tunneling through platforms
  - Horizontal collision resolved before vertical movement (lines 765-779)
  - Vertical collision detected with velocity tracking to determine direction (lines 791-827)

## Cross-Cutting Concerns

**Logging:** Console logging not used; debug state accessible via browser dev tools

**Validation:** Minimal validation; game assumes well-formed entity objects and valid canvas context
- World generation creates entities with guaranteed valid properties
- Collision functions perform basic AABB checks without bounds validation

**Authentication:** Not applicable (single-player, offline game)

**Responsive Scaling:**
- Canvas width/height calculated via `resizeCanvas()` function (lines 21-33)
- All rendering scaled by `getScale()` multiplier (line 682-684): `canvas.width / BASE_WIDTH`
- Logical coordinates maintained at 1200x700, scaled for display
- Fullscreen mode handled via CSS (`:fullscreen` pseudo-class) and JavaScript event listener

**Platform Support:**
- Touch controls automatically enabled on touch devices via CSS media query (line 296: `@media (pointer: coarse)`)
- Touch button handlers (lines 521-562) for iPad/tablet compatibility
- Canvas touch fallback (lines 565-595) divides screen into thirds for legacy touch support
- Keyboard support for desktop (arrow keys, WASD, Space)
- All input methods update same flags (`touchLeft`, `touchRight`, `keys.jump`)

**Camera System:**
- Fixed camera offset `cameraX` (line 18)
- Updated per frame to follow player: `targetCameraX = player.x - SCREEN_CENTER`
- Clamped to world bounds: `Math.max(0, Math.min(targetCameraX, worldWidth - BASE_WIDTH))`
- All rendering uses `(worldX - cameraX) * scale` to convert world coordinates to screen space

---

*Architecture analysis: 2026-02-04*
