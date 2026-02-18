# Coding Conventions

**Analysis Date:** 2026-02-04

## Naming Patterns

**Files:**
- Lowercase: `index.html`, `style.css`, `game.js`
- No hyphens or underscores in filenames
- Assets in `assets/` directory with sprite naming: `poppy1.png`, `poppy2.png`, `enemy1.png`, etc.

**Functions:**
- camelCase for all function names
- Descriptive action-based names: `drawPlayer()`, `checkCollision()`, `generateWorld()`, `playJumpSound()`
- Prefix convention: `draw*` for rendering, `play*` for audio, `check*` for collision/validation, `init*` for initialization
- Examples: `drawPlatform()`, `drawEnemy()`, `checkCoinCollision()`, `initAudio()`

**Variables:**
- camelCase for all variables
- Descriptive, explicit names
- Global state variables: `gameRunning`, `gameStarted`, `currentLevel`, `cameraX`
- Entity properties: `velocityX`, `velocityY`, `jumpForce`, `gravity`, `moveRange`
- Boolean flags: `playerImageLoaded`, `gameWon`, `levelComplete`, `doingSalto`, `breakable`, `grounded`
- Collection naming uses plural: `platforms`, `enemies`, `coins`, `debris`, `cannons`, `cannonballs`, `walkFrames`
- Screen/rendering: `screenX`, `screenY`, `drawWidth`, `drawHeight`, `baseY`, `baseX`

**Constants:**
- UPPER_SNAKE_CASE: `BASE_WIDTH`, `BASE_HEIGHT`, `SCREEN_CENTER`
- Configuration objects are lowercase: `levelConfig`
- Magic numbers are avoided when possible and commented for physics constants

**Types:**
- Plain objects used throughout (no classes/prototypes)
- Entity patterns: player, platform, enemy, coin, debris, cannon, cannonball
- Platform has type property: `type: 'floor'` or `type: 'platform'`
- State object patterns use clear property names matching usage

## Code Style

**Formatting:**
- Indentation: 4 spaces (not tabs)
- Line length: Generally 80-100 characters but not strict
- Semicolons: Always used to terminate statements
- Brace placement: Egyptian style (opening brace on same line)
- No spaces inside parentheses, but single space before opening braces

**Examples:**
```javascript
function updateDebris() {
    debris = debris.filter(d => {
        d.x += d.vx;
        d.vy += 0.4;
        return d.life > 0;
    });
}

const player = {
    x: 100,
    y: 400,
    velocityX: 0
};
```

**Linting:**
- No linter configuration detected
- Code follows implicit conventions based on established patterns
- No build process enforces style

## Import Organization

**Not applicable:** Vanilla JavaScript with no module system. All code in single `game.js` file.

**Global references:**
- DOM elements cached at top: `canvas`, `ctx`, `scoreDisplay`, `levelDisplay`, `restartBtn`, `fullscreenBtn`, `gameContainer`
- Image assets loaded at top: `playerImage`, `walkFrames`, `jumpImage`, `enemyWalkFrames`, `cannonImage`
- Audio context initialized lazily: `audioContext` (null until first sound)

**Dependency pattern:**
All state/functions available in global scope. No namespacing beyond section comments.

## Error Handling

**Pattern: Silent Fallbacks**

No try-catch blocks. Error handling through:

1. **Image loading** - Fallback rendering if assets missing:
```javascript
playerImage.onerror = () => { playerImageLoaded = false; };
// Later in draw:
if (playerImageLoaded) {
    ctx.drawImage(currentImage, ...);
} else {
    // Draw canvas-based fallback
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.ellipse(...);
}
```

2. **Audio initialization** - Graceful degradation:
```javascript
function playJumpSound() {
    initAudio();
    if (!audioContext) return;  // Silent fail
    // ... play sound
}
```

3. **Optional properties** - Guarded access:
```javascript
const drawW = (enemy.drawWidth || enemy.width) * scale;
const hasEnemyFrames = enemyWalkFramesLoaded >= enemyWalkFrameCount && enemyImg && enemyImg.loaded;
if (hasEnemyFrames) {
    // use sprite
} else {
    // use fallback
}
```

4. **Collision checks** - Return early on invalid state:
```javascript
platforms.forEach(platform => {
    if (platform.broken) return;  // Skip broken platforms
    if (checkCollision(...)) { ... }
});
```

**No validation errors thrown** - Game continues with sensible defaults. Failed asset loads result in canvas-drawn fallbacks, not crashes.

## Logging

**Framework:** None - uses direct `console` methods

**Pattern:**
- No explicit logging statements in production code
- All user-facing messaging through canvas rendering (on-screen text)
- Comment-only debugging approach - comments explain state changes rather than logging them
- Dutch language comments document game state transitions

**Examples of state explanation:**
```javascript
// Salto
doingSalto: false,

// Walk animatie
walkFrame: 0,
walkTimer: 0,

// Level configuratie - moeilijkheid neemt toe per level
const levelConfig = { ... }
```

## Comments

**When to Comment:**
- Explain game mechanics: "25% kans op salto!" at line 716
- Explain level design intent: "Garandeer dat er vloer is onder de vlag" at line 313
- Explain physics constants: gravity, jumpForce, speeds
- Section headers with separators: `// ============================================`
- State complexity: when a variable serves multiple purposes

**Style:**
- Dutch language throughout (matching game UI text)
- Single-line comments for brief explanations
- Section headers use long comment separators for visual organization
- No JSDoc/TypeScript-style documentation

**Examples:**
```javascript
// Soms een gat in de vloer (niet bij de vlag)
const gapAllowed = floorX > 800 && ...

// Vijanden - afstand en snelheid op basis van level
let enemyX = 800;
```

## Function Design

**Size:**
- Generally 10-50 lines per function
- Longest functions are drawing routines (50-100 lines): `draw()`, `drawPlayer()`, `drawBackground()`
- Utility functions are typically 5-20 lines
- Average ~30 lines

**Parameters:**
- Minimal parameters - most functions use global state
- Entity objects passed as single parameter: `drawPlayer()` accesses global `player`, `drawEnemy(enemy)` takes enemy as parameter
- No parameter validation or type hints
- Default values used rarely (wobble parameter in `doodleRect` has default)

**Return Values:**
- Many functions return nothing (`void`)
- Update functions modify global arrays/objects in-place: `platforms.forEach(p => { ... })`
- Utility functions return primitives: `checkCollision()` returns boolean, `getScale()` returns number
- Filtering operations return new arrays: `enemies = enemies.filter(e => !e.defeated)`

**Example patterns:**
```javascript
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawPlayer() {
    // ... 70 lines of drawing logic
    // Returns nothing, modifies canvas directly
}
```

## Module Design

**Monolithic structure:**
- Single 1943-line file with no module system
- Organized by sections with visual comment separators:
  - AFBEELDINGEN (Images)
  - AUDIO SYSTEEM (Audio System)
  - GAME STATE
  - SPELER (Player)
  - WERELD ELEMENTEN (World Elements)
  - BESTURING (Controls)
  - FULLSCREEN
  - GAME FUNCTIES (Game Functions)
  - UPDATE
  - TEKEN FUNCTIES (Drawing Functions)
  - MAIN LOOP
  - START

**Global state:**
- All entity arrays global: `platforms`, `enemies`, `coins`, `debris`, `cannons`, `cannonballs`
- Game state variables global: `gameRunning`, `score`, `currentLevel`, `levelComplete`
- No class instances - plain object literals for entities
- Single shared canvas context: `ctx`

**Exports:**
- Not applicable - no module system. All code in one file executes on page load.

**Barrel files:**
- Not applicable

**Initialization pattern:**
```javascript
// At file end:
resizeCanvas();
scoreDisplay.textContent = 'Score: 0';
levelDisplay.textContent = `Level: ${currentLevel}`;
gameLoop();  // Kick off animation loop
```

## HTML/CSS Conventions

**HTML (`index.html`):**
- Dutch language for all text: `<button id="restartBtn" class="restart-btn">Opnieuw Spelen</button>`
- semantic IDs match JavaScript selectors: `getElementById('gameCanvas')`, `getElementById('scoreDisplay')`
- Touch controls outside main container for fixed positioning reliability
- No inline styles except `style="display: none"` for initial button hiding

**CSS (`style.css`):**
- BEM-like naming: `.game-title`, `.game-container`, `.touch-zone-left`, `.touch-btn-jump`
- Imports Google Font: Patrick Hand for consistent hand-drawn aesthetic
- Fallback fonts: Comic Sans MS, Chalkboard, cursive
- CSS custom properties: Not used (inline values throughout)
- Media query for touch detection: `@media (pointer: coarse), (hover: none)`
- Transforms used for visual rotation/tilt: `transform: rotate(-1.2deg)`
- Box shadows for cartoon depth effect

---

*Convention analysis: 2026-02-04*
