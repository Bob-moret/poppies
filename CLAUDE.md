# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Poppies is a browser-based 2D platformer game (pirate adventure theme) built with vanilla JavaScript, HTML5 Canvas, and CSS. No frameworks, no dependencies, no build process.

## Running the Game

Open `index.html` directly in a browser, or serve via a local HTTP server for reliable asset loading:

```bash
python -m http.server 8000
# or
npx http-server
```

There is no build step, no package manager, no linting, and no test suite.

## Architecture

The entire game lives in three files:

- **`index.html`** — Canvas element, score/level display, control instructions (Dutch), restart/fullscreen buttons
- **`style.css`** — Pirate/cartoon theme, responsive canvas scaling, fullscreen support
- **`game.js`** — All game logic (~1375 lines), organized into these major sections:

### Game Loop

`requestAnimationFrame`-based loop calling `update()` then `draw()` each frame. All physics use fixed constants (gravity: 0.9, jumpForce: -24).

### Entity System

All entities are plain objects (no classes):
- **Player**: position, velocity, walk animation (4 sprite frames), 25% salto chance on jump, sprite flipping for direction
- **Platforms**: floor segments (continuous with gaps) and floating platforms (35% breakable). Breakable platforms spawn debris particles when head-bumped from below.
- **Enemies**: patrol between baseX ± moveRange, defeated by jumping on them, rendered as red-tinted poppy
- **Coins**: bounce animation, grouped in patterns (arcs, vertical lines, platform-aligned)
- **Debris**: physics particles from broken platforms, fade over 60 frames

### World Generation

`generateWorld()` procedurally creates a 5000px-wide level with floor segments, floating platforms, enemies (placed on stable platforms only), and coins in various patterns.

### Collision System

AABB collision detection (`checkCollision`). Horizontal and vertical collisions are resolved separately per axis. Coin collision uses a 30px radius check.

### Camera & Rendering

Camera follows player horizontally, clamped to world bounds. Background elements (sky, clouds, sun, sea) parallax at 15% camera speed. All coordinates are multiplied by `getScale()` for responsive rendering against a 1200×700 logical resolution.

### Doodle Rendering

`doodleRect()` and `doodleCircle()` produce a hand-drawn visual style using seed-based randomization for stable wobble across frames.

### Audio

All sounds are procedurally generated via Web Audio API (no audio files). Lazy-initialized on first user interaction to comply with browser autoplay policies. Five synthesized sounds: jump, coin, enemy defeat, game over, platform break.

### Input

Keyboard (Arrow keys / WASD / Space) and touch (screen divided into thirds: left=move left, right=move right, center=jump) are both supported simultaneously.

### State Persistence

High score stored in `localStorage`.

## Assets

Player sprites in `assets/`: poppy1.png through poppy4.png (walk cycle). Missing optional sprites (poppy_jump.png, enemy.png) have canvas-drawn fallbacks.

## Language

UI text and code comments are in Dutch.
