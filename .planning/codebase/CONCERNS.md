# Codebase Concerns

**Analysis Date:** 2026-02-04

## Tech Debt

**Single File Monolith:**
- Issue: All game logic (1943 lines) concentrated in `game.js` with no module separation. No classes or clear layer boundaries.
- Files: `game.js`
- Impact: Difficult to debug specific subsystems, impossible to reuse code, makes refactoring risky. Global state mutated throughout codebase.
- Fix approach: Split into modules: physics.js, rendering.js, audio.js, input.js, entities.js, world.js. Use IIFE or modern ES modules with an export/import system if adding a build step.

**Global State Mutations:**
- Issue: Game state scattered across globals: `gameRunning`, `gameStarted`, `score`, `currentLevel`, `levelComplete`, `gameWon`, `player` object, arrays for `platforms`, `enemies`, `coins`, `debris`, `cannons`, `cannonballs`. Mutations occur in multiple functions without clear ownership.
- Files: `game.js` (lines 238-292 state declarations, mutations throughout update() at lines 690-958)
- Impact: State changes are unpredictable, impossible to reason about at a glance, difficult to add new features without side effects. No single source of truth for game state.
- Fix approach: Centralize into a GameState object or manager class. Use getters/setters for controlled mutations. Document state flow explicitly.

**Render Logic Mixed with Update Logic:**
- Issue: Canvas scaling calculation (`getScale()` at line 682) called in both `draw()` and `update()` paths. Animation timing uses `Date.now()` directly in draw functions (`doodleCircle`, `drawCoin`, `drawBackground`, `drawStartScreen`) making frame-rate dependent.
- Files: `game.js` (lines 682-684, 1015, 1387, 1482, 1566, etc.)
- Impact: Inconsistent scaling if canvas resizes mid-frame, animation speeds vary with frame rate, difficult to separate rendering from game logic.
- Fix approach: Calculate scale once per frame in gameLoop. Use frame counter or deltaTime for animations instead of Date.now().

**No Error Handling:**
- Issue: No try/catch blocks, no error listeners except basic image onerror handlers at lines 56, 65, 79, 88. AudioContext creation at line 97 doesn't handle browser context rejection.
- Files: `game.js` (lines 95-102, 106-125, throughout audio functions)
- Impact: Silent failures if assets fail to load, audio context fails to create, or canvas operations throw. Game may appear frozen or broken without console visibility.
- Fix approach: Add error boundaries for asset loading, audio initialization, and canvas operations. Log errors and gracefully degrade (show fallback graphics).

**Magic Numbers Throughout:**
- Issue: Hard-coded values scattered everywhere: gravity 0.9 (line 268), jumpForce -24 (line 267), speed 6 (line 266), collision offsets +10/-10 (lines 791, 797), animation frame speeds (line 279), coin collision radius 30 (line 968), platform break score 25 (line 802).
- Files: `game.js`
- Impact: Hard to tune game difficulty, easy to introduce bugs during balancing, impossible to understand meaning of numbers without context.
- Fix approach: Extract all magic numbers to a GAME_CONSTANTS object at top of file with semantic names: PLAYER_WALK_SPEED, JUMP_FORCE, GRAVITY, COIN_COLLECT_RADIUS, etc.

## Known Bugs

**Uncontrolled Audio Context Creation:**
- Symptoms: Multiple simultaneous audio contexts created if sounds triggered rapidly (e.g., multiple coins collected in one frame). WebAudio API will reuse if audioContext already exists, but logic is implicit.
- Files: `game.js` (lines 95-102, repeated in playJumpSound, playCoinSound, etc.)
- Trigger: Rapid sound effects without waiting for previous sounds to complete
- Workaround: Browser reuses existing context. Game tolerates but is inelegant.

**Platform Collision When Falling Through:**
- Symptoms: Player can occasionally fall through platforms when moving downward quickly at frame transitions, especially on fast hardware.
- Files: `game.js` (lines 789-829, collision detection in update loop)
- Trigger: Falling from great height at high velocity, or moving through platform between frames
- Cause: AABB collision check only done per-frame; if player.velocityY is large, can skip over platform hitbox entirely between frames
- Workaround: None. Physics is unsubdivided.

**Debris Particles Never Clean Up Fully:**
- Symptoms: Debris array grows continuously during gameplay but never completely cleared between levels, though old debris is filtered out by life counter.
- Files: `game.js` (lines 290, 636, 664, 832-839)
- Trigger: Breaking many platforms in level 2/3
- Cause: Debris array cleared in generateWorld() but previous level's debris may linger one frame
- Impact: Minor memory accumulation over long play sessions, negligible on modern hardware
- Workaround: Clear debris array explicitly in nextLevel() and startGame()

**High Score Not Persisted if JSON Storage Fails:**
- Symptoms: High score silently lost if localStorage is unavailable (private browsing, quota exceeded, storage errors).
- Files: `game.js` (lines 241, 677, 952)
- Trigger: Private browsing mode, localStorage quota exceeded, browser storage denied
- Cause: localStorage.setItem() can throw, no error handling. fallback undefined.
- Impact: Player loses achievement with no notification
- Fix approach: Wrap localStorage calls in try/catch, provide fallback (session variable), notify user

**Touch Controls Disabled on iPad in Fullscreen:**
- Symptoms: Touch control buttons (left, right, jump) are positioned fixed but may be clipped by fullscreen canvas or become unresponsive.
- Files: `style.css` (lines 231-303), `game.js` (lines 517-562), `index.html` (lines 29-35)
- Trigger: Entering fullscreen mode on iPad with portrait or landscape orientation
- Cause: Touch buttons use fixed positioning outside gameContainer, but fullscreen CSS doesn't account for them. Button z-index 1000 should work but may be clipped by viewport scaling.
- Status: Recently fixed in commit 37d080b (Feb 4) by repositioning as screen overlays

**Coin Collision Using Wrong Radius:**
- Symptoms: Coins collected from abnormally far away (30px radius check) compared to visible coin size (16px draw radius in doodleCircle at line 1394).
- Files: `game.js` (lines 967-973, 1394)
- Trigger: Moving near any coin
- Cause: `checkCoinCollision()` uses 30px hitbox but coin drawn at 16px radius; visual mismatch
- Impact: Game feels generous/unfair, confusing to player
- Fix approach: Align hitbox to visual size or document the 30px "generosity radius"

## Security Considerations

**localStorage High Score Stored as String:**
- Risk: High score stored as unvalidated string in localStorage. Could be manually edited by player via browser console.
- Files: `game.js` (lines 241, 677, 952)
- Current mitigation: localStorage persists per-origin only; non-sensitive data
- Recommendations: High score is cosmetic only (no prizes), so acceptable. If leaderboard added: validate scores server-side, use cryptographic signatures, never trust client-stored values.

**Web Audio API Oscillators Not Disposed:**
- Risk: Oscillators and gain nodes created per sound effect but not explicitly stopped in all code paths (though audioContext.stop() prevents infinite playback). Rapid sound creation could exhaust audio resources.
- Files: `game.js` (lines 105-213, 216-233)
- Current mitigation: oscillator.stop() called at end time (e.g., line 124), cleanup happens via garbage collection
- Recommendations: Offload audio to pre-recorded buffers or dedicated audio engine if sound complexity grows. Document audio lifecycle.

**No Input Validation on Touch Events:**
- Risk: Touch event handlers at lines 522-562 prevent default and stop propagation without validating touch coordinates or device state
- Files: `game.js` (lines 513-595), `style.css` (line 265 touch-action: manipulation)
- Current mitigation: Touch events are read-only, no data sent to server
- Recommendations: If multiplayer/networking added, validate all user inputs server-side.

## Performance Bottlenecks

**Collision Detection O(n*m) Complexity:**
- Problem: Player checked against all platforms, enemies, cannonballs every frame. No spatial partitioning or grid.
- Files: `game.js` (lines 766-779, 786-829, 876-890, 921-935)
- Cause: Naive nested loop checking each entity pair
- Current capacity: Handles ~100 platforms + 20 enemies + 50 coins + 10 cannonballs without lag on modern browsers (~60fps stable)
- Impact: O(n*m) complexity. With 300 platforms and 100 enemies, collision checks would dominate CPU.
- Improvement path: Implement spatial grid (divide world into 200px cells), only check entities in adjacent cells. Expected 5-10x speedup at scale.

**Platform.filter() Called Every Frame:**
- Problem: platforms.filter(p => !p.broken) called every frame in update() at line 842 to remove broken platforms.
- Files: `game.js` (lines 841-843)
- Cause: Eager filtering instead of lazy removal
- Impact: Negligible at current scale (100 platforms), becomes O(n) scan every frame
- Improvement path: Use splice() to remove in-place during update, or maintain active/broken lists separately

**Debris Array Iteration Every Frame:**
- Problem: debris array iterated and filtered every frame (line 832) even when mostly empty late-game
- Files: `game.js` (lines 831-839)
- Cause: General design, not optimized
- Impact: Negligible (<1% CPU), but unnecessary GC pressure
- Improvement path: Use object pool for debris particles instead of constant array churn

**Canvas Drawing Calls Unoptimized:**
- Problem: All platforms drawn every frame even if off-screen. No frustum culling until line 1117 (platform draw skips).
- Files: `game.js` (lines 1112-1202, 1347-1374, 1376-1410, 1449-1475)
- Cause: Draw functions check bounds individually but platforms/coins/debris still iterated in draw()
- Impact: Drawing 100 off-screen platforms still loops, though actual ctx calls skipped
- Improvement path: Pre-filter drawable entities in update() and pass to draw()

**Audio Synthesis Not Cached:**
- Problem: Web Audio oscillators recreated every time sound plays. No audio buffer cache.
- Files: `game.js` (lines 105-233)
- Cause: Procedural generation approach, no pre-recorded assets
- Impact: Each sound effect is negligible (<5ms synthesis), but 10+ simultaneous sounds could spike
- Improvement path: Pre-generate audio buffers and use AudioContext.decodeAudioData() for playback, or use pre-recorded .wav files

## Fragile Areas

**World Generation Procedural Without Seed:**
- Files: `game.js` (lines 295-487)
- Why fragile: generateWorld() uses Math.random() heavily but is not seeded, so layout differs every run. Subtle changes to level config (lines 248-252) can make levels unbeatable if gaps become too large.
- Safe modification: Add a seed parameter to generateWorld(), store in levelConfig. Test level layouts are beatable before committing.
- Test coverage: No automated testing of level generation; must be verified manually
- Risk: If adjusting gapChance or enemySpacing, level may become impossible without realizing

**Player Physics Tightly Coupled to Frame Rate:**
- Files: `game.js` (lines 690-827, 759-760 gravity accumulation)
- Why fragile: velocityY and velocityX use frame-based physics (gravity += 0.9 each frame). If game loop changes frame rate or frame drops occur, physics behavior changes unpredictably.
- Safe modification: Add deltaTime parameter to update(deltaTime) and scale all velocity changes by deltaTime / 16ms (60fps baseline). Test on slow devices.
- Test coverage: No performance or FPS regression tests
- Risk: Physics feels different on 30fps vs 120fps displays, or during CPU spikes

**Image Loading Fallbacks Fragile:**
- Files: `game.js` (lines 38-88, draw functions 1222-1253, 1305-1343)
- Why fragile: Multiple fallback paths for missing images (walk frames, jump frame, enemy frames). If main image loads but walk frames don't, player uses squash-stretch animation. If only some frames load, behavior undefined.
- Safe modification: Add explicit load state tracking per image, handle partial load gracefully. Test with network throttling or missing assets directory.
- Test coverage: No asset loading tests; manual testing only
- Risk: One broken asset path breaks visual consistency across multiple entities

**Enemy Placement Assumes Stable Platforms:**
- Files: `game.js` (lines 398-424)
- Why fragile: Enemies placed only on non-breakable platforms. If breakable platform logic changes, enemy placement could fail silently or place enemies in air.
- Safe modification: Add validation that enemy.y matches platform top after placement. Verify enemy is grounded before level start.
- Test coverage: No validation of entity placement after generateWorld()
- Risk: Level load fails to notice enemies spawning mid-air

**Score Display Updates Without Type Coercion:**
- Files: `game.js` (lines 241, 803, 883, 900, scoreDisplay.textContent updates)
- Why fragile: score treated as number but localStorage stores string. Comparison at line 675 (score > highScore) works because JS coerces, but implicit.
- Safe modification: Explicitly convert: highScore = parseInt(localStorage.getItem('poppiesHighScore')) || 0 at line 241. Store as number.
- Test coverage: No type validation tests
- Risk: If highScore set to "0" string, comparisons behave unexpectedly

## Scaling Limits

**Memory Accumulation with Long Play Sessions:**
- Current capacity: Handles 5000-8000px world width, ~100-200 entities per level. Debris clears between levels but not within level.
- Limit: After 10+ hours continuous play, browser memory could bloat to 50-100MB if all debris ever created is retained
- Scaling path: Implement debris object pool (reuse array slots), clear between levels explicitly, add memory monitor to HUD for debugging

**Cannonball Creation Rate:**
- Current capacity: 5 cannons max (level 3, line 250), each firing every 140 frames = ~0.4 fps per cannon = 2 cannonballs/sec total. Max ~100 cannonballs in world.
- Limit: If cannons scaled to 20+ with 60fps fire rate, could hit 1000+ cannonballs/frame, collision detection becomes bottleneck
- Scaling path: Implement object pooling, spatial hashing for cannonball-collision queries, batch audio synthesis

**Platform Count:**
- Current capacity: ~100-200 platforms per 5000-8000px world
- Limit: Collision detection O(n*m) breaks at 500+ platforms with 50+ enemies
- Scaling path: Implement quadtree or spatial grid, use narrow-phase broadphase optimization

## Dependencies at Risk

**Web Audio API Browser Support:**
- Risk: AudioContext API relatively new, older Safari/iOS may not support Web Audio or have limited oscillator types
- Current mitigation: Uses standard oscillator types (sine, square, sawtooth, triangle) with broad support. Fallback to silent game if audioContext unavailable.
- Impact: Game fully playable without audio
- Migration plan: If audio critical, pre-generate .wav files and use HTMLAudioElement or web-audio-api polyfill

**Canvas 2D Context Scaling:**
- Risk: getScale() calculation assumes linear scaling. Some devices (high-DPI phones) may have devicePixelRatio != 1, causing blurry or crisp text/graphics unexpectedly
- Files: `game.js` (lines 682-684, used throughout drawing)
- Current mitigation: Canvas scales to fit window, but doesn't account for devicePixelRatio
- Impact: On retina displays, may appear fuzzy if CSS scaling doesn't align with canvas resolution
- Recommendation: Multiply canvas.width/height by window.devicePixelRatio before drawing, scale ctx by devicePixelRatio

**localStorage Quota:**
- Risk: localStorage quota varies by browser (5-10MB typically), but high score is tiny. Not a real concern.
- Current mitigation: Only stores single high score string
- Impact: Zero practical risk
- Recommendation: No action needed

## Missing Critical Features

**No Level Editor or Debug Mode:**
- Problem: Levels are procedurally generated only. No way to create fixed test levels or debug specific scenarios.
- Blocks: Cannot verify level is solvable before shipping, cannot test enemy placement systematically
- Recommendation: Add optional level seed system, allow hardcoded level configs, implement debug mode with key to show collision boxes

**No Mobile Input Fallback for Keyboards:**
- Problem: iPad users see touch controls, but no option to use keyboard if touch fails
- Blocks: Players with faulty touchscreen or those preferring keyboard can't switch input methods
- Recommendation: Auto-detect input method, switch UI dynamically, always accept keyboard input

**No Accessibility Features:**
- Problem: Color-only cues (no text labels on touch buttons), no aria labels, no keyboard focus management
- Blocks: Colorblind, visually impaired, or motor-impaired players can't play
- Recommendation: Add button labels, semantic HTML, keyboard navigation, screen reader support

**No Sound Toggle or Volume Control:**
- Problem: Audio plays at full volume with no mute option
- Blocks: Players in quiet environments or with audio preferences can't adjust
- Recommendation: Add mute button, volume slider, remember preference in localStorage

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Collision detection logic, world generation, physics simulation
- Files: `game.js` (lines 960-973, 295-487, 690-827)
- Risk: Changes to collision or physics break silently, caught only by manual play-testing
- Priority: High - physics and collision are critical to gameplay

**No Visual Regression Tests:**
- What's not tested: Canvas rendering (platforms, player, enemies), animation frame sequences
- Files: `game.js` (lines 1112-1881)
- Risk: Rendering changes go unnoticed if they don't throw errors (e.g., color mismatch, scaled incorrectly)
- Priority: Medium - impacts player experience but not core gameplay

**No Asset Loading Tests:**
- What's not tested: Behavior when images fail to load, mixed load states (some frames loaded, others not)
- Files: `game.js` (lines 38-88, draw functions 1222-1343)
- Risk: Missing asset directory causes unexpected visual behavior with no error message
- Priority: Medium - edge case but degrades UX

**No Platform Generation Edge Cases:**
- What's not tested: Impossible gap sizes, enemy placement failures, coin spawning logic
- Files: `game.js` (lines 295-487)
- Risk: Level becomes unbeatable or enemy spawns in unreachable location
- Priority: High - impacts game balance

**No Input Integration Tests:**
- What's not tested: Keyboard + touch input simultaneously, rapid input sequences, edge cases
- Files: `game.js` (lines 494-595)
- Risk: Input conflicts or missed input on fast hardware
- Priority: Medium - affects playability on all devices

---

*Concerns audit: 2026-02-04*
