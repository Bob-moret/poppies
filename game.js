// ============================================
// POPPIES - Piraten Platformer
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const restartBtn = document.getElementById('restartBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameContainer = document.getElementById('gameContainer');

// Game afmetingen
const BASE_WIDTH = 1200;
const BASE_HEIGHT = 700;

// Camera
let cameraX = 0;

// Canvas grootte
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function resizeCanvas() {
    const isFullscreen = !!document.fullscreenElement;
    const isMobileLandscape = isTouchDevice() && window.innerWidth > window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    let cssWidth, cssHeight;
    if (isFullscreen || isMobileLandscape) {
        const maxWidth = window.innerWidth * (isMobileLandscape ? 1.0 : 0.95);
        const maxHeight = window.innerHeight * (isMobileLandscape ? 1.0 : 0.85);
        const ratio = Math.min(maxWidth / BASE_WIDTH, maxHeight / BASE_HEIGHT);
        cssWidth = BASE_WIDTH * ratio;
        cssHeight = BASE_HEIGHT * ratio;
    } else {
        cssWidth = Math.min(BASE_WIDTH, window.innerWidth - 40);
        cssHeight = (cssWidth / BASE_WIDTH) * BASE_HEIGHT;
    }

    // CSS bepaalt weergavegrootte, canvas.width/height bepaalt renderresolutie
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
}

// ============================================
// AFBEELDINGEN
// ============================================
// Standaard/idle afbeelding
const playerImage = new Image();
let playerImageLoaded = false;
playerImage.src = 'assets/poppy1.png';
playerImage.onload = () => { playerImageLoaded = true; };

// Walk animatie frames
const walkFrames = [];
const walkFrameCount = 4;
let walkFramesLoaded = 0;

for (let i = 1; i <= walkFrameCount; i++) {
    const img = new Image();
    img.src = `assets/poppy${i}.png`;
    img.onload = () => {
        img.loaded = true;
        walkFramesLoaded++;
    };
    img.onerror = () => { img.loaded = false; };
    walkFrames.push(img);
}

// Jump frame (optioneel)
const jumpImage = new Image();
let jumpImageLoaded = false;
jumpImage.src = 'assets/poppy_jump.png';
jumpImage.onload = () => { jumpImageLoaded = true; };
jumpImage.onerror = () => { jumpImageLoaded = false; };

// Vijand walk animatie frames
const enemyWalkFrames = [];
const enemyWalkFrameCount = 4;
let enemyWalkFramesLoaded = 0;

for (let i = 1; i <= enemyWalkFrameCount; i++) {
    const img = new Image();
    img.src = `assets/enemy${i}.png`;
    img.onload = () => {
        img.loaded = true;
        enemyWalkFramesLoaded++;
    };
    img.onerror = () => { img.loaded = false; };
    enemyWalkFrames.push(img);
}

// Kanon sprite
const cannonImage = new Image();
let cannonImageLoaded = false;
cannonImage.src = 'assets/canon.png';
cannonImage.onload = () => { cannonImageLoaded = true; };
cannonImage.onerror = () => { cannonImageLoaded = false; };

// Achtergrond sprites
const bgImage = new Image();
let bgImageLoaded = false;
bgImage.src = 'assets/achtergrond.png';
bgImage.onload = () => { bgImageLoaded = true; };
bgImage.onerror = () => { bgImageLoaded = false; };

const cloudsImage = new Image();
let cloudsImageLoaded = false;
cloudsImage.src = 'assets/wolken.png';
cloudsImage.onload = () => { cloudsImageLoaded = true; };
cloudsImage.onerror = () => { cloudsImageLoaded = false; };

const sunImage = new Image();
let sunImageLoaded = false;
sunImage.src = 'assets/zon.png';
sunImage.onload = () => { sunImageLoaded = true; };
sunImage.onerror = () => { sunImageLoaded = false; };

const groundImage = new Image();
let groundImageLoaded = false;
groundImage.src = 'assets/grond.png';
groundImage.onload = () => { groundImageLoaded = true; };
groundImage.onerror = () => { groundImageLoaded = false; };

// Platform sprites
const platformImage = new Image();
let platformImageLoaded = false;
platformImage.src = 'assets/platform.png';
platformImage.onload = () => { platformImageLoaded = true; };
platformImage.onerror = () => { platformImageLoaded = false; };

const platformCrackedImage = new Image();
let platformCrackedImageLoaded = false;
platformCrackedImage.src = 'assets/platform cracked.png';
platformCrackedImage.onload = () => { platformCrackedImageLoaded = true; };
platformCrackedImage.onerror = () => { platformCrackedImageLoaded = false; };

// Munt sprites (afwisselend)
const coinFrames = [];
const coinFrameCount = 2;
let coinFramesLoaded = 0;

for (let i = 1; i <= coinFrameCount; i++) {
    const img = new Image();
    img.src = `assets/coin${i}.png`;
    img.onload = () => { img.loaded = true; coinFramesLoaded++; };
    img.onerror = () => { img.loaded = false; };
    coinFrames.push(img);
}

// ============================================
// AUDIO SYSTEEM
// ============================================
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Poing geluid bij springen
function playJumpSound() {
    initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Munt verzamel geluid
function playCoinSound() {
    initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Vijand verslagen geluid
function playEnemyDefeatSound() {
    initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Game over geluid
function playGameOverSound() {
    initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Platform breek geluid
function playBreakSound() {
    initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Level voltooid geluid - vrolijk oplopend melodietje
function playLevelCompleteSound() {
    initAudio();
    if (!audioContext) return;

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
    });
}

// ============================================
// GAME STATE
// ============================================
let gameRunning = false;
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem('poppiesHighScore') || 0;
let currentLevel = 1;
let levelComplete = false;
let gameWon = false;
let flag = null;
let waitingForName = false; // Wacht op naam invoer voor scorebord
let showingLeaderboard = false; // Scorebord tonen na naam invoer

// Scorebord laden uit localStorage
function loadLeaderboard() {
    try {
        const data = localStorage.getItem('poppiesLeaderboard');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// Scorebord opslaan in localStorage (max 10 entries, gesorteerd op score)
function saveLeaderboard(leaderboard) {
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('poppiesLeaderboard', JSON.stringify(leaderboard));
    return leaderboard;
}

// Score toevoegen aan scorebord
function addToLeaderboard(name, playerScore) {
    const leaderboard = loadLeaderboard();
    leaderboard.push({ name: name, score: playerScore });
    return saveLeaderboard(leaderboard);
}

// Naam invoer elementen
const nameInputOverlay = document.getElementById('nameInputOverlay');
const playerNameInput = document.getElementById('playerNameInput');
const nameSubmitBtn = document.getElementById('nameSubmitBtn');

// Naam invoer tonen
function showNameInput() {
    waitingForName = true;
    showingLeaderboard = false;
    nameInputOverlay.style.display = 'flex';
    playerNameInput.value = '';
    playerNameInput.focus();
}

// Naam invoer verbergen
function hideNameInput() {
    waitingForName = false;
    nameInputOverlay.style.display = 'none';
}

// Naam invoer bevestigen
function submitName() {
    let name = playerNameInput.value.trim();
    if (!name) name = 'Piraat';
    addToLeaderboard(name, score);
    hideNameInput();
    showingLeaderboard = true;
    restartBtn.style.display = 'inline-block';
}

// Event listeners voor naam invoer
nameSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    submitName();
});

playerNameInput.addEventListener('keydown', (e) => {
    e.stopPropagation(); // Voorkom dat game controls reageren
    if (e.code === 'Enter') {
        e.preventDefault();
        submitName();
    }
});

// Voorkom dat spatie in invoerveld het spel herstart
playerNameInput.addEventListener('keyup', (e) => {
    e.stopPropagation();
});

playerNameInput.addEventListener('keypress', (e) => {
    e.stopPropagation();
});

// Level configuratie - moeilijkheid neemt toe per level
const levelConfig = {
    1: { worldWidth: 5000, gapChance: 0.20, breakableChance: 0.25, enemySpacing: 500, enemySpeed: 1.5, cannonCount: 0, cannonFireRate: 0 },
    2: { worldWidth: 6500, gapChance: 0.30, breakableChance: 0.35, enemySpacing: 400, enemySpeed: 2.5, cannonCount: 3, cannonFireRate: 180 },
    3: { worldWidth: 8000, gapChance: 0.40, breakableChance: 0.45, enemySpacing: 300, enemySpeed: 3.5, cannonCount: 5, cannonFireRate: 140 }
};

// ============================================
// SPELER
// ============================================
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
    grounded: false,
    jumpHeld: false,
    jumpCut: false,
    facingRight: true,
    // Salto
    rotation: 0,
    doingSalto: false,
    // Spin (lengteas)
    doingSpin: false,
    spinAngle: 0,
    // Walk animatie
    walkFrame: 0,
    walkTimer: 0,
    walkFrameSpeed: 8 // Hoe hoger, hoe langzamer de animatie
};

const SCREEN_CENTER = BASE_WIDTH / 2 - player.width / 2;

// ============================================
// WERELD ELEMENTEN
// ============================================
let platforms = [];
let enemies = [];
let coins = [];
let debris = []; // Brokstukken van gebroken platforms
let cannons = [];
let cannonballs = [];
let worldWidth = 5000; // Totale wereld breedte

function generateWorld() {
    platforms = [];
    enemies = [];
    coins = [];
    cannons = [];
    cannonballs = [];

    const config = levelConfig[currentLevel];
    worldWidth = config.worldWidth;

    // Vlag positie
    const flagX = worldWidth - 300;

    // Vloer segmenten (met gaten)
    let floorX = 0;
    while (floorX < worldWidth) {
        const segmentWidth = 400 + Math.random() * 600;

        // Garandeer dat er vloer is onder de vlag
        const segmentEnd = floorX + segmentWidth;
        const coversFlag = floorX <= flagX && segmentEnd >= flagX + 80;
        const nearFlag = flagX - floorX < 600 && flagX > floorX;

        platforms.push({
            x: floorX,
            y: 600,
            width: nearFlag && !coversFlag ? Math.max(segmentWidth, flagX - floorX + 200) : segmentWidth,
            height: 100,
            type: 'floor'
        });

        const actualWidth = nearFlag && !coversFlag ? Math.max(segmentWidth, flagX - floorX + 200) : segmentWidth;

        // Soms een gat in de vloer (niet bij de vlag)
        const gapAllowed = floorX > 800 && (floorX + actualWidth + 200) < flagX - 100;
        const gapChance = gapAllowed ? config.gapChance : 0;
        if (Math.random() < gapChance) {
            floorX += actualWidth + 120 + Math.random() * 80;
        } else {
            floorX += actualWidth;
        }
    }

    // Vlag object aanmaken
    flag = {
        x: flagX,
        y: 600, // Bovenkant van de vloer
        width: 60,
        height: 120, // Paal hoogte
        reached: false
    };

    // Zwevende platforms - hoger en meer verspreid
    let platformX = 400;
    let lastPlatformY = 400;

    while (platformX < worldWidth - 500) {
        const gap = 220 + Math.random() * 280;
        platformX += gap;

        const heightChange = (Math.random() - 0.5) * 180;
        let py = lastPlatformY + heightChange;
        py = Math.max(200, Math.min(450, py));
        lastPlatformY = py;

        const pw = 120 + Math.random() * 100;
        const breakable = Math.random() < config.breakableChance;

        platforms.push({
            x: platformX,
            y: py,
            width: pw,
            height: 40,
            type: 'platform',
            breakable: breakable,
            broken: false
        });

        if (Math.random() < 0.5) {
            coins.push({
                x: platformX + pw / 2 - 15,
                y: py - 60,
                collected: false
            });
        }

        if (Math.random() < 0.3) {
            const extraX = platformX + 100 + Math.random() * 150;
            const extraY = py > 350 ? py - 100 - Math.random() * 80 : py + 100 + Math.random() * 80;
            if (extraY > 180 && extraY < 480) {
                platforms.push({
                    x: extraX,
                    y: extraY,
                    width: 100 + Math.random() * 80,
                    height: 40,
                    type: 'platform',
                    breakable: Math.random() < 0.4,
                    broken: false
                });
            }
        }
    }

    // Vijanden - afstand en snelheid op basis van level
    let enemyX = 800;
    while (enemyX < worldWidth - 400) {
        enemyX += config.enemySpacing + Math.random() * config.enemySpacing;

        const platform = platforms.find(p =>
            !p.breakable && enemyX >= p.x + 30 && enemyX <= p.x + p.width - 80
        );

        if (platform) {
            enemies.push({
                x: enemyX,
                y: platform.y - player.height,
                width: player.width,
                height: player.height,
                drawWidth: player.drawWidth,
                drawHeight: player.drawHeight,
                baseX: enemyX,
                moveRange: 60 + Math.random() * 80,
                speed: 1 + Math.random() * (config.enemySpeed - 1),
                direction: 1,
                platformY: platform.y,
                walkFrame: 0,
                walkTimer: 0
            });
        }
    }

    // Munten in de lucht - leuke patronen
    let coinX = 250;
    while (coinX < worldWidth - 200) {
        coinX += 200 + Math.random() * 300;

        if (Math.random() < 0.3) {
            const baseY = 300 + Math.random() * 150;
            for (let i = 0; i < 5; i++) {
                const arcY = baseY - Math.sin(i / 4 * Math.PI) * 80;
                coins.push({
                    x: coinX + i * 40,
                    y: arcY,
                    collected: false
                });
            }
            coinX += 200;
        }
        else if (Math.random() < 0.4) {
            const baseY = 250 + Math.random() * 100;
            for (let i = 0; i < 3; i++) {
                coins.push({
                    x: coinX,
                    y: baseY + i * 50,
                    collected: false
                });
            }
        }
        else {
            coins.push({
                x: coinX,
                y: 220 + Math.random() * 280,
                collected: false
            });
        }
    }

    // Kanonnen plaatsen op vloersegmenten (alleen level 2+)
    if (config.cannonCount > 0) {
        const floorPlatforms = platforms.filter(p => p.type === 'floor');
        const spacing = worldWidth / (config.cannonCount + 1);

        for (let i = 0; i < config.cannonCount; i++) {
            const targetX = spacing * (i + 1);

            // Zoek het dichtstbijzijnde vloersegment
            const floor = floorPlatforms.find(p => targetX >= p.x && targetX <= p.x + p.width - 90);
            if (floor) {
                const cannonWidth = 90;
                const cannonHeight = 55;
                cannons.push({
                    x: targetX,
                    y: floor.y - cannonHeight,
                    width: cannonWidth,
                    height: cannonHeight,
                    direction: Math.random() < 0.5 ? -1 : 1,
                    fireTimer: Math.floor(Math.random() * config.cannonFireRate),
                    fireRate: config.cannonFireRate
                });
            }
        }
    }
}

// ============================================
// BESTURING
// ============================================
const keys = { left: false, right: false, jump: false };

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        keys.jump = true;
        if (waitingForName) return; // Wacht op naam invoer
        if (showingLeaderboard) { showingLeaderboard = false; restartGame(); return; }
        if (!gameStarted) startGame();
        else if (levelComplete && !gameWon) nextLevel();
        else if (gameWon) restartGame();
        else if (!gameRunning) restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keys.jump = false;
});

// Touch support
let touchLeft = false, touchRight = false;

// Touch button controls (iPad/tablet)
const touchBtnLeft = document.getElementById('touchBtnLeft');
const touchBtnRight = document.getElementById('touchBtnRight');
const touchBtnJump = document.getElementById('touchBtnJump');

function handleTouchBtn(btn, onStart, onEnd) {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add('active');
        onStart();
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.remove('active');
        onEnd();
    });
    btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        onEnd();
    });
}

handleTouchBtn(touchBtnLeft,
    () => { touchLeft = true; },
    () => { touchLeft = false; }
);
handleTouchBtn(touchBtnRight,
    () => { touchRight = true; },
    () => { touchRight = false; }
);
handleTouchBtn(touchBtnJump,
    () => {
        if (waitingForName) return;
        if (showingLeaderboard) { showingLeaderboard = false; restartGame(); return; }
        if (!gameStarted) { startGame(); return; }
        if (levelComplete && !gameWon) { nextLevel(); return; }
        if (gameWon) { restartGame(); return; }
        if (!gameRunning) { restartGame(); return; }
        if (player.grounded) {
            player.velocityY = player.jumpForce;
            player.grounded = false;
            playJumpSound();
        }
    },
    () => {}
);

// Canvas touch fallback (voor devices zonder zichtbare knoppen)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (waitingForName) return;
    if (showingLeaderboard) { showingLeaderboard = false; restartGame(); return; }
    if (!gameStarted) { startGame(); return; }
    if (levelComplete && !gameWon) { nextLevel(); return; }
    if (gameWon) { restartGame(); return; }
    if (!gameRunning) { restartGame(); return; }

    for (let touch of e.touches) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;

        if (x < rect.width / 3) {
            touchLeft = true;
        } else if (x > rect.width * 2 / 3) {
            touchRight = true;
        } else {
            if (player.grounded) {
                player.velocityY = player.jumpForce;
                player.grounded = false;
                playJumpSound();
            }
        }
    }
});

canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        touchLeft = false;
        touchRight = false;
    }
});

// ============================================
// FULLSCREEN
// ============================================
function goFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    }
}

fullscreenBtn.addEventListener('click', goFullscreen);

// Op mobiel landscape: automatisch fullscreen bij eerste interactie
if (isTouchDevice()) {
    let autoFullscreenDone = false;
    const tryAutoFullscreen = () => {
        if (autoFullscreenDone) return;
        if (window.innerWidth > window.innerHeight && !document.fullscreenElement) {
            goFullscreen();
        }
        autoFullscreenDone = true;
        document.removeEventListener('touchstart', tryAutoFullscreen);
    };
    document.addEventListener('touchstart', tryAutoFullscreen, { once: true });
}

document.addEventListener('fullscreenchange', () => {
    resizeCanvas();
    canvas.focus();
});

document.addEventListener('webkitfullscreenchange', () => {
    resizeCanvas();
    canvas.focus();
});

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

restartBtn.addEventListener('click', () => {
    if (waitingForName) return;
    restartGame();
});

// ============================================
// GAME FUNCTIES
// ============================================

function startGame() {
    initAudio();
    gameStarted = true;
    gameRunning = true;
    score = 0;
    currentLevel = 1;
    levelComplete = false;
    gameWon = false;
    waitingForName = false;
    showingLeaderboard = false;
    hideNameInput();
    cameraX = 0;

    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.facingRight = true;

    debris = [];
    cannons = [];
    cannonballs = [];
    generateWorld();
    restartBtn.style.display = 'none';
    scoreDisplay.textContent = 'Score: 0';
    levelDisplay.textContent = `Level: ${currentLevel}`;
}

function restartGame() {
    startGame();
}

function nextLevel() {
    currentLevel++;
    levelComplete = false;
    gameRunning = true;
    cameraX = 0;

    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.facingRight = true;
    player.rotation = 0;
    player.doingSalto = false;

    debris = [];
    cannons = [];
    cannonballs = [];
    generateWorld();
    restartBtn.style.display = 'none';
    levelDisplay.textContent = `Level: ${currentLevel}`;
}

function gameOver() {
    gameRunning = false;
    showingLeaderboard = false;
    playGameOverSound();
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('poppiesHighScore', highScore);
    }
    // Toon naam invoer voor scorebord (verberg herstart knop tot na invoer)
    restartBtn.style.display = 'none';
    showNameInput();
}

function getScale() {
    return canvas.width / BASE_WIDTH;
}

// ============================================
// UPDATE
// ============================================

function update() {
    if (!gameRunning) return;

    // Horizontale beweging
    const moveLeft = keys.left || touchLeft;
    const moveRight = keys.right || touchRight;

    if (moveLeft) {
        player.velocityX = -player.speed;
        player.facingRight = false;
    } else if (moveRight) {
        player.velocityX = player.speed;
        player.facingRight = true;
    } else {
        player.velocityX *= 0.8;
    }

    // Springen
    if (keys.jump && player.grounded) {
        player.velocityY = player.jumpForce;
        player.grounded = false;
        player.jumpHeld = true;
        player.jumpCut = false;
        playJumpSound();

        // 25% salto, 10% spin
        const trickRoll = Math.random();
        if (trickRoll < 0.25) {
            player.doingSalto = true;
            player.rotation = 0;
        } else if (trickRoll < 0.35) {
            player.doingSpin = true;
            player.spinAngle = 0;
        }
    }

    // Variabele spronghoogte - laat los voor lagere sprong
    if (!keys.jump && player.jumpHeld && !player.jumpCut && player.velocityY < 0) {
        player.velocityY *= 0.4; // Verminder opwaartse snelheid flink bij loslaten
        player.jumpCut = true;
    }
    if (player.grounded) {
        player.jumpHeld = false;
        player.jumpCut = false;
    }

    // Update salto rotatie
    if (player.doingSalto && !player.grounded) {
        player.rotation += 0.15; // Draai snelheid
        if (player.rotation >= Math.PI * 2) {
            player.rotation = 0;
            player.doingSalto = false;
        }
    }

    // Update spin (lengteas)
    if (player.doingSpin && !player.grounded) {
        player.spinAngle += 0.2;
        if (player.spinAngle >= Math.PI * 2) {
            player.spinAngle = 0;
            player.doingSpin = false;
        }
    }

    // Reset rotatie bij landen
    if (player.grounded) {
        player.rotation = 0;
        player.doingSalto = false;
        player.spinAngle = 0;
        player.doingSpin = false;
    }

    // Walk animatie update
    if (Math.abs(player.velocityX) > 0.5 && player.grounded) {
        player.walkTimer++;
        if (player.walkTimer >= player.walkFrameSpeed) {
            player.walkTimer = 0;
            player.walkFrame = (player.walkFrame + 1) % walkFrameCount;
        }
    } else {
        player.walkFrame = 0;
        player.walkTimer = 0;
    }

    // Zwaartekracht
    player.velocityY += player.gravity;

    // Horizontale beweging
    player.x += player.velocityX;

    // Horizontale collision met platforms
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Van links botsen
            if (player.velocityX > 0 && player.x + player.width - player.velocityX <= platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            // Van rechts botsen
            else if (player.velocityX < 0 && player.x - player.velocityX >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });

    // Verticale beweging
    player.y += player.velocityY;

    // Verticale collision met platforms
    player.grounded = false;
    platforms.forEach(platform => {
        if (platform.broken) return; // Skip gebroken platforms

        if (checkCollision(player, platform)) {
            // Van boven landen
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y + 10) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
            // Van onder botsen
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height - 10) {
                // Check of platform breekbaar is
                if (platform.breakable && platform.type === 'platform') {
                    // Breek het platform!
                    platform.broken = true;
                    score += 25;
                    scoreDisplay.textContent = `Score: ${score}`;
                    playBreakSound();

                    // Maak brokstukken
                    for (let i = 0; i < 6; i++) {
                        debris.push({
                            x: platform.x + Math.random() * platform.width,
                            y: platform.y + Math.random() * platform.height,
                            vx: (Math.random() - 0.5) * 8,
                            vy: -Math.random() * 8 - 2,
                            size: 8 + Math.random() * 12,
                            rotation: Math.random() * Math.PI * 2,
                            rotationSpeed: (Math.random() - 0.5) * 0.3,
                            life: 60
                        });
                    }

                    // Kleine bounce voor de speler
                    player.velocityY = 2;
                } else {
                    // Normaal platform - gewoon stoppen
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }
    });

    // Update debris
    debris = debris.filter(d => {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.4; // Zwaartekracht
        d.rotation += d.rotationSpeed;
        d.life--;
        return d.life > 0;
    });

    // Verwijder gebroken platforms
    platforms = platforms.filter(p => !p.broken);

    // Wereld grenzen
    if (player.x < 0) player.x = 0;
    if (player.x > worldWidth - player.width) player.x = worldWidth - player.width;

    // Gevallen in een gat
    if (player.y > 800) {
        gameOver();
    }

    // Camera volgt speler
    const targetCameraX = player.x - SCREEN_CENTER;
    cameraX = Math.max(0, Math.min(targetCameraX, worldWidth - BASE_WIDTH));

    // Update vijanden
    enemies.forEach(enemy => {
        // Heen en weer bewegen
        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x <= enemy.baseX - enemy.moveRange) {
            enemy.direction = 1;
        } else if (enemy.x >= enemy.baseX + enemy.moveRange) {
            enemy.direction = -1;
        }

        // Walk animatie
        enemy.walkTimer++;
        if (enemy.walkTimer >= 10) {
            enemy.walkTimer = 0;
            enemy.walkFrame = (enemy.walkFrame + 1) % enemyWalkFrameCount;
        }

        // Collision met speler
        if (checkCollision(player, enemy)) {
            // Check of speler van boven komt (op vijand springt)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + 20) {
                // Vijand verslagen!
                enemy.defeated = true;
                player.velocityY = player.jumpForce * 0.6; // Kleine bounce
                score += 100;
                scoreDisplay.textContent = `Score: ${score}`;
                playEnemyDefeatSound();
            } else if (!enemy.defeated) {
                // Geraakt door vijand
                gameOver();
            }
        }
    });

    // Verwijder verslagen vijanden
    enemies = enemies.filter(e => !e.defeated);

    // Munten verzamelen
    coins.forEach(coin => {
        if (!coin.collected && checkCoinCollision(player, coin)) {
            coin.collected = true;
            score += 50;
            scoreDisplay.textContent = `Score: ${score}`;
            playCoinSound();
        }
    });

    // Update kanonnen en kanonskogels
    cannons.forEach(cannon => {
        cannon.fireTimer--;
        if (cannon.fireTimer <= 0) {
            cannon.fireTimer = cannon.fireRate;
            cannonballs.push({
                x: cannon.x + (cannon.direction > 0 ? cannon.width - 5 : -10),
                y: cannon.y + 5,
                width: 12,
                height: 12,
                velocityX: cannon.direction * 3,
                velocityY: -1.5
            });
        }
    });

    cannonballs = cannonballs.filter(ball => {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // Verwijder als buiten wereld
        if (ball.x < -50 || ball.x > worldWidth + 50 || ball.y < -100) return false;

        // Collision met speler
        if (checkCollision(player, ball)) {
            gameOver();
            return false;
        }

        return true;
    });

    // Vlag collision - level voltooid
    if (flag && !flag.reached) {
        const flagHitbox = { x: flag.x, y: flag.y - flag.height, width: flag.width, height: flag.height };
        if (checkCollision(player, flagHitbox)) {
            flag.reached = true;
            levelComplete = true;
            gameRunning = false;
            playLevelCompleteSound();

            if (currentLevel >= 3) {
                gameWon = true;
            }

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('poppiesHighScore', highScore);
            }
        }
    }

    levelDisplay.textContent = `Level: ${currentLevel}`;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCoinCollision(player, coin) {
    const coinSize = 30;
    return player.x < coin.x + coinSize &&
           player.x + player.width > coin.x &&
           player.y < coin.y + coinSize &&
           player.y + player.height > coin.y;
}

// ============================================
// TEKEN FUNCTIES
// ============================================

// Stabiele pseudo-random gebaseerd op seed
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 9999;
    return x - Math.floor(x);
}

// Doodle rechthoek met wiebelige randen (stabiel)
function doodleRect(x, y, w, h, wobble = 3) {
    const scale = getScale();
    const wo = wobble * scale * 0.6;
    const seed = Math.floor(x * 0.1 + y * 7);
    ctx.beginPath();
    ctx.moveTo(x + (seededRandom(seed) - 0.5) * wo, y + (seededRandom(seed + 1) - 0.5) * wo);
    ctx.lineTo(x + w + (seededRandom(seed + 2) - 0.5) * wo, y + (seededRandom(seed + 3) - 0.5) * wo);
    ctx.lineTo(x + w + (seededRandom(seed + 4) - 0.5) * wo, y + h + (seededRandom(seed + 5) - 0.5) * wo);
    ctx.lineTo(x + (seededRandom(seed + 6) - 0.5) * wo, y + h + (seededRandom(seed + 7) - 0.5) * wo);
    ctx.closePath();
}

// Doodle cirkel (stabiel)
function doodleCircle(x, y, r, segments = 12) {
    const seed = Math.floor(x * 0.1 + y * 7);
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const wobble = r * 0.05 * Math.sin(i * 3 + seededRandom(seed + i) * 2);
        const px = x + Math.cos(angle) * (r + wobble);
        const py = y + Math.sin(angle) * (r + wobble);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawBackground() {
    const scale = getScale();
    const time = Date.now() / 1000;

    // Laag 1 — achtergrond.png (langzaamste parallax ~5%)
    if (bgImageLoaded) {
        const bgScale = canvas.height / bgImage.height;
        const bgW = bgImage.width * bgScale;
        const offsetX = -(cameraX * 0.05 * scale) % bgW;
        // Tegel de achtergrond zodat er geen gaten ontstaan
        for (let x = offsetX; x < canvas.width; x += bgW) {
            ctx.drawImage(bgImage, x, 0, bgW, canvas.height);
        }
        if (offsetX > 0) {
            ctx.drawImage(bgImage, offsetX - bgW, 0, bgW, canvas.height);
        }
    } else {
        // Fallback: effen blauwe lucht + zee
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const seaY = canvas.height * 0.65;
        ctx.fillStyle = '#4FC3F7';
        ctx.fillRect(0, seaY, canvas.width, canvas.height - seaY);

        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(0, seaY);
        ctx.lineTo(canvas.width, seaY);
        ctx.stroke();

        // Golven
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3 * scale;
        for (let row = 0; row < 3; row++) {
            ctx.beginPath();
            const yBase = seaY + 30 * scale + row * 40 * scale;
            for (let x = 0; x < canvas.width + 50; x += 40 * scale) {
                const waveOffset = cameraX * 0.2 + row * 100 + time * 50;
                const xPos = x - (waveOffset * scale) % (40 * scale);
                ctx.moveTo(xPos, yBase);
                ctx.quadraticCurveTo(xPos + 20 * scale, yBase - 15 * scale, xPos + 40 * scale, yBase);
            }
            ctx.stroke();
        }
    }

    // Laag 2 — zon.png (parallax ~3%, nauwelijks bewegend)
    if (sunImageLoaded) {
        const sunH = 300 * scale;
        const sunScale = sunH / sunImage.height;
        const sunW = sunImage.width * sunScale;
        const sunOffsetX = -(cameraX * 0.03 * scale);
        ctx.drawImage(sunImage, sunOffsetX, 0, sunW, sunH);
    } else {
        // Fallback: procedurele zon met stralen en gezichtje
        const sunX = (200 - cameraX * 0.03) * scale;
        const sunY = 90 * scale;
        const sunR = 50 * scale;

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4 * scale;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 0.5;
            const innerR = sunR + 10 * scale;
            const outerR = sunR + 30 * scale + Math.sin(time * 3 + i) * 5 * scale;
            ctx.beginPath();
            ctx.moveTo(sunX + Math.cos(angle) * innerR, sunY + Math.sin(angle) * innerR);
            ctx.lineTo(sunX + Math.cos(angle) * outerR, sunY + Math.sin(angle) * outerR);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFDD00';
        doodleCircle(sunX, sunY, sunR);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 4 * scale;
        ctx.stroke();

        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(sunX - 15 * scale, sunY - 5 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.arc(sunX + 15 * scale, sunY - 5 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.arc(sunX, sunY + 5 * scale, 20 * scale, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    // Laag 3 — wolken.png (parallax ~15%)
    if (cloudsImageLoaded) {
        const cloudScale = canvas.height / cloudsImage.height;
        const cloudW = cloudsImage.width * cloudScale;
        const cloudOffsetX = -(cameraX * 0.15 * scale) % cloudW;
        for (let x = cloudOffsetX; x < canvas.width; x += cloudW) {
            ctx.drawImage(cloudsImage, x, 0, cloudW, canvas.height);
        }
        if (cloudOffsetX > 0) {
            ctx.drawImage(cloudsImage, cloudOffsetX - cloudW, 0, cloudW, canvas.height);
        }
    } else {
        // Fallback: procedurele wolken
        for (let i = 0; i < 5; i++) {
            const baseX = (i * 350) % (BASE_WIDTH * 2);
            const cloudX = ((baseX - cameraX * 0.15) % (BASE_WIDTH * 1.8) + BASE_WIDTH * 1.8) % (BASE_WIDTH * 1.8) * scale;
            const cy = (60 + (i * 47) % 100) * scale;
            const cloudSize = (40 + (i * 13) % 30) * scale;

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cloudX, cy, cloudSize, 0, Math.PI * 2);
            ctx.arc(cloudX - cloudSize * 0.7, cy + cloudSize * 0.2, cloudSize * 0.6, 0, Math.PI * 2);
            ctx.arc(cloudX + cloudSize * 0.7, cy + cloudSize * 0.1, cloudSize * 0.7, 0, Math.PI * 2);
            ctx.arc(cloudX - cloudSize * 0.3, cy - cloudSize * 0.3, cloudSize * 0.5, 0, Math.PI * 2);
            ctx.arc(cloudX + cloudSize * 0.4, cy - cloudSize * 0.25, cloudSize * 0.55, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();
        }
    }
}

function drawPlatform(platform) {
    const scale = getScale();
    const screenX = (platform.x - cameraX) * scale;

    // Skip als buiten scherm
    if (screenX + platform.width * scale < 0 || screenX > canvas.width) return;

    const py = platform.y * scale;
    const pw = platform.width * scale;
    const ph = platform.height * scale;

    ctx.save();

    if (platform.type === 'floor') {
        if (groundImageLoaded) {
            // Grond.png als textuur: onderste deel van het beeld als planken
            const srcH = 50; // Onderste 50px van de 268px afbeelding
            const srcY = groundImage.height - srcH;
            const srcImgW = groundImage.width; // 1920px

            // Clip naar platform grenzen
            ctx.save();
            ctx.beginPath();
            ctx.rect(screenX, py, pw, ph);
            ctx.clip();

            // Tegel horizontaal, source-X gebaseerd op wereld-positie voor naadloze tiling
            const tileW = srcImgW * scale * (ph / (srcH * scale)); // Behoud aspect ratio
            const worldOffsetX = (platform.x % srcImgW) * scale;
            const startX = screenX - worldOffsetX;

            for (let x = startX; x < screenX + pw; x += tileW) {
                ctx.drawImage(groundImage, 0, srcY, srcImgW, srcH, x, py, tileW, ph);
            }
            // Tegel ook links als nodig
            if (startX > screenX) {
                ctx.drawImage(groundImage, 0, srcY, srcImgW, srcH, startX - tileW, py, tileW, ph);
            }

            ctx.restore();
        } else {
            // Fallback: cartoony vloer/dek van de boot
            ctx.fillStyle = '#DEB887';
            doodleRect(screenX, py, pw, ph, 2);
            ctx.fill();

            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 4 * scale;
            ctx.stroke();

            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2 * scale;
            for (let i = 20 * scale; i < ph; i += 25 * scale) {
                const plankSeed = Math.floor(platform.x + i);
                ctx.beginPath();
                ctx.moveTo(screenX + 5, py + i + (seededRandom(plankSeed) - 0.5) * 2);
                ctx.lineTo(screenX + pw - 5, py + i + (seededRandom(plankSeed + 1) - 0.5) * 2);
                ctx.stroke();
            }

            ctx.fillStyle = '#222222';
            for (let i = 30 * scale; i < pw; i += 80 * scale) {
                ctx.beginPath();
                ctx.arc(screenX + i, py + 10 * scale, 3 * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else {
        // Zwevend platform met sprite
        const useSprite = platform.breakable
            ? (platformCrackedImageLoaded && platformCrackedImage)
            : (platformImageLoaded && platformImage);

        if (useSprite) {
            ctx.drawImage(useSprite, screenX, py, pw, ph);
        } else {
            // Fallback: cartoony zwevend platform
            ctx.fillStyle = platform.breakable ? '#F4A460' : '#DEB887';
            doodleRect(screenX, py, pw, ph, 3);
            ctx.fill();
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 4 * scale;
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawPlayer() {
    const scale = getScale();
    ctx.save();

    // Collision box positie
    const screenX = (player.x - cameraX) * scale;
    const py = player.y * scale;
    const pw = player.width * scale;
    const ph = player.height * scale;

    // Teken grootte (groter dan collision box)
    const drawW = player.drawWidth * scale;
    const drawH = player.drawHeight * scale;

    // Centreer horizontaal op collision box, voeten op onderkant collision box
    const centerX = screenX + pw / 2;
    const bottomY = py + ph;

    if (playerImageLoaded) {
        ctx.translate(centerX, bottomY - drawH / 2);

        if (!player.facingRight) {
            ctx.scale(-1, 1);
        }

        // Salto rotatie
        if (player.doingSalto) {
            ctx.rotate(player.rotation);
        }

        // Spin om lengteas (3D-effect via horizontale schaling)
        if (player.doingSpin) {
            ctx.scale(Math.cos(player.spinAngle), 1);
        }

        // Kies de juiste afbeelding
        let currentImage = playerImage;
        let useSquashStretch = false;

        // In de lucht
        if (!player.grounded) {
            if (jumpImageLoaded && jumpImage.loaded) {
                currentImage = jumpImage;
            }
        }
        // Aan het lopen
        else if (Math.abs(player.velocityX) > 0.5) {
            const walkImg = walkFrames[player.walkFrame];
            if (walkFramesLoaded >= walkFrameCount && walkImg && walkImg.loaded) {
                currentImage = walkImg;
            } else {
                // Fallback: squash & stretch animatie
                useSquashStretch = true;
            }
        }

        // Teken met squash/stretch als geen walk frames
        if (useSquashStretch) {
            const stretch = 1 + Math.sin(Date.now() / 60) * 0.08;
            const squash = 1 / stretch;
            ctx.scale(squash, stretch);
            const bounce = Math.abs(Math.sin(Date.now() / 80)) * 6 * scale;
            ctx.drawImage(currentImage, -drawW/2, -drawH/2 - bounce, drawW, drawH);
        } else {
            ctx.drawImage(currentImage, -drawW/2, -drawH/2, drawW, drawH);
        }
    } else {
        // Fallback - grotere tekening
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.ellipse(centerX, bottomY - drawH/2, drawW/2, drawH/2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawEnemy(enemy) {
    const scale = getScale();
    const screenX = (enemy.x - cameraX) * scale;

    // Skip als buiten scherm
    if (screenX + enemy.width * scale < -50 || screenX > canvas.width + 50) return;

    ctx.save();

    const ey = enemy.y * scale;
    const ew = enemy.width * scale;
    const eh = enemy.height * scale;

    // Teken grootte (zelfde als speler)
    const drawW = (enemy.drawWidth || enemy.width) * scale;
    const drawH = (enemy.drawHeight || enemy.height) * scale;

    // Centreer horizontaal op collision box, voeten op onderkant collision box
    const centerX = screenX + ew / 2;
    const bottomY = ey + eh;

    ctx.translate(centerX, bottomY - drawH / 2);

    // Kijk richting beweging (sprites kijken standaard naar links)
    if (enemy.direction > 0) {
        ctx.scale(-1, 1);
    }

    // Walk animatie frame kiezen
    const enemyImg = enemyWalkFrames[enemy.walkFrame];
    const hasEnemyFrames = enemyWalkFramesLoaded >= enemyWalkFrameCount && enemyImg && enemyImg.loaded;

    if (hasEnemyFrames) {
        ctx.drawImage(enemyImg, -drawW/2, -drawH/2, drawW, drawH);
    } else if (playerImageLoaded) {
        // Fallback: rode poppy
        ctx.filter = 'hue-rotate(140deg) saturate(2)';
        ctx.drawImage(playerImage, -drawW/2, -drawH/2, drawW, drawH);
        ctx.filter = 'none';
    } else {
        // Fallback: rode cirkel met boze ogen
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(0, 0, drawW/2, drawH/2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(-8 * scale, -10 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(8 * scale, -10 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-6 * scale, -8 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.arc(10 * scale, -8 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(-15 * scale, -18 * scale);
        ctx.lineTo(-3 * scale, -14 * scale);
        ctx.moveTo(15 * scale, -18 * scale);
        ctx.lineTo(3 * scale, -14 * scale);
        ctx.stroke();
    }

    ctx.restore();
}

function drawDebris() {
    const scale = getScale();

    debris.forEach(d => {
        const screenX = (d.x - cameraX) * scale;
        if (screenX < -50 || screenX > canvas.width + 50) return;

        ctx.save();
        ctx.translate(screenX, d.y * scale);
        ctx.rotate(d.rotation);

        // Fade out
        ctx.globalAlpha = d.life / 60;

        // Houten brokstuk
        ctx.fillStyle = '#A67C52';
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 1 * scale;

        const size = d.size * scale;
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.strokeRect(-size/2, -size/2, size, size);

        ctx.restore();
    });

    ctx.globalAlpha = 1;
}

function drawCoin(coin) {
    if (coin.collected) return;

    const scale = getScale();
    const screenX = (coin.x - cameraX) * scale;

    if (screenX < -50 || screenX > canvas.width + 50) return;

    ctx.save();

    const cy = coin.y * scale;
    const time = Date.now() / 400;
    const bounce = Math.sin(time * 3) * 3 * scale;
    const coinSize = 36 * scale;

    ctx.translate(screenX + 15 * scale, cy + 15 * scale + bounce);

    if (coinFramesLoaded >= coinFrameCount) {
        // Rustige 3D rotatie: coin1 aan voorkant, coin2 aan achterkant
        const spinSpeed = 0.0015; // Langzame rotatie
        const angle = (Date.now() * spinSpeed) % (Math.PI * 2);
        const scaleX = Math.cos(angle);

        // Kies zijde: voorkant (coin1) of achterkant (coin2)
        const frameIndex = scaleX >= 0 ? 0 : 1;
        const img = coinFrames[frameIndex];

        if (img && img.loaded) {
            // Horizontale schaling voor 3D-effect
            ctx.scale(Math.abs(scaleX), 1);
            ctx.drawImage(img, -coinSize / 2, -coinSize / 2, coinSize, coinSize);
        }
    } else {
        // Fallback: procedurele munt
        ctx.fillStyle = '#FFD700';
        doodleCircle(0, 0, 16 * scale);
        ctx.fill();

        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 4 * scale;
        ctx.stroke();

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${18 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1 * scale);
    }

    ctx.restore();
}

function drawCannon(cannon) {
    const scale = getScale();
    const screenX = (cannon.x - cameraX) * scale;

    // Skip als buiten scherm
    if (screenX + cannon.width * scale < -50 || screenX > canvas.width + 50) return;

    ctx.save();

    const cw = cannon.width * scale;
    const ch = cannon.height * scale;
    const cy = cannon.y * scale;

    if (cannonImageLoaded) {
        // Sprite tekenen: afbeelding wijst naar links-omhoog
        if (cannon.direction < 0) {
            // Richting links: sprite ongewijzigd tekenen
            ctx.drawImage(cannonImage, screenX, cy, cw, ch);
        } else {
            // Richting rechts: horizontaal spiegelen
            ctx.translate(screenX + cw, cy);
            ctx.scale(-1, 1);
            ctx.drawImage(cannonImage, 0, 0, cw, ch);
        }
    } else {
        // Fallback: eenvoudig kanon als sprite niet geladen is
        ctx.fillStyle = '#444444';
        doodleRect(screenX, cy, cw, ch, 3);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 4 * scale;
        ctx.stroke();
    }

    ctx.restore();
}

function drawCannonball(ball) {
    const scale = getScale();
    const screenX = (ball.x - cameraX) * scale;

    if (screenX < -50 || screenX > canvas.width + 50) return;

    ctx.save();

    const by = ball.y * scale;
    const br = 6 * scale;

    // Zwarte kanonskogel
    ctx.fillStyle = '#222222';
    doodleCircle(screenX + br, by + br, br);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Glans highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(screenX + br - 2 * scale, by + br - 2 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawFlag() {
    if (!flag) return;

    const scale = getScale();
    const screenX = (flag.x - cameraX) * scale;
    const time = Date.now() / 1000;

    if (screenX + flag.width * scale < -50 || screenX > canvas.width + 50) return;

    ctx.save();

    const baseY = flag.y * scale;
    const poleHeight = flag.height * scale;
    const poleX = screenX + 15 * scale;

    // Houten paal (doodle-stijl)
    ctx.fillStyle = '#8B4513';
    doodleRect(poleX - 5 * scale, baseY - poleHeight, 10 * scale, poleHeight, 2);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Bol bovenop de paal
    ctx.fillStyle = '#FFD700';
    doodleCircle(poleX, baseY - poleHeight, 8 * scale);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Piraten-vlag (wapperend)
    const flagW = 50 * scale;
    const flagH = 35 * scale;
    const flagStartX = poleX + 3 * scale;
    const flagStartY = baseY - poleHeight + 10 * scale;

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(flagStartX, flagStartY);

    // Wapperende bovenkant
    const wave1 = Math.sin(time * 3) * 4 * scale;
    const wave2 = Math.sin(time * 3 + 1) * 3 * scale;
    ctx.quadraticCurveTo(flagStartX + flagW * 0.5, flagStartY + wave1, flagStartX + flagW, flagStartY + wave2);

    // Wapperende onderkant
    const wave3 = Math.sin(time * 3 + 2) * 4 * scale;
    ctx.lineTo(flagStartX + flagW + wave3, flagStartY + flagH);
    ctx.quadraticCurveTo(flagStartX + flagW * 0.5, flagStartY + flagH + wave1 * 0.5, flagStartX, flagStartY + flagH);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Doodskop op de vlag
    const skullX = flagStartX + flagW * 0.45 + wave1 * 0.3;
    const skullY = flagStartY + flagH * 0.45;
    const skullSize = 8 * scale;

    // Schedel
    ctx.fillStyle = '#FFFFFF';
    doodleCircle(skullX, skullY, skullSize);
    ctx.fill();

    // Ogen
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(skullX - 3 * scale, skullY - 1 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(skullX + 3 * scale, skullY - 1 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Gekruiste botten onder schedel
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(skullX - 6 * scale, skullY + skullSize + 2 * scale);
    ctx.lineTo(skullX + 6 * scale, skullY + skullSize + 8 * scale);
    ctx.moveTo(skullX + 6 * scale, skullY + skullSize + 2 * scale);
    ctx.lineTo(skullX - 6 * scale, skullY + skullSize + 8 * scale);
    ctx.stroke();

    ctx.restore();
}

function drawLevelComplete() {
    const scale = getScale();
    const time = Date.now() / 1000;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const boxW = 500 * scale;
    const boxH = 320 * scale;
    const boxX = canvas.width / 2 - boxW / 2;
    const boxY = canvas.height / 2 - boxH / 2;

    ctx.fillStyle = '#FFF8DC';
    doodleRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();

    // Wiebelige titel
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 90 * scale);
    ctx.rotate(Math.sin(time * 2) * 0.03);

    ctx.fillStyle = '#222222';
    ctx.font = `bold ${44 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${currentLevel} Voltooid!`, 3 * scale, 3 * scale);
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`Level ${currentLevel} Voltooid!`, 0, 0);
    ctx.restore();

    // Score
    ctx.fillStyle = '#FFD700';
    ctx.font = `${60 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('⭐', canvas.width / 2, canvas.height / 2 - 5 * scale);

    ctx.fillStyle = '#222222';
    ctx.font = `bold ${22 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40 * scale);

    // Volgende level prompt
    const blink = Math.sin(time * 4) > 0;
    if (blink) {
        const btnW = 340 * scale;
        const btnH = 45 * scale;
        const btnX = canvas.width / 2 - btnW / 2;
        const btnY = canvas.height / 2 + 65 * scale;

        ctx.fillStyle = '#90EE90';
        doodleRect(btnX, btnY, btnW, btnH, 4);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textBaseline = 'middle';
        ctx.fillText('SPATIE = Volgend Level', canvas.width / 2, btnY + btnH / 2);
        ctx.textBaseline = 'alphabetic';
    }

    // Decoraties
    ctx.font = `${30 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText('🏴‍☠️', boxX + 35 * scale, boxY + 40 * scale);
    ctx.fillText('🎉', boxX + boxW - 45 * scale, boxY + 40 * scale);
}

function drawGameWon() {
    const scale = getScale();
    const time = Date.now() / 1000;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const boxW = 500 * scale;
    const boxH = 350 * scale;
    const boxX = canvas.width / 2 - boxW / 2;
    const boxY = canvas.height / 2 - boxH / 2;

    ctx.fillStyle = '#FFF8DC';
    doodleRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();

    // Wiebelige titel
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 100 * scale);
    ctx.rotate(Math.sin(time * 2) * 0.04);

    ctx.fillStyle = '#222222';
    ctx.font = `bold ${52 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('GEWONNEN!', 3 * scale, 3 * scale);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('GEWONNEN!', 0, 0);
    ctx.restore();

    // Subtitel
    ctx.fillStyle = '#222222';
    ctx.font = `bold ${22 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('Alle levels voltooid!', canvas.width / 2, canvas.height / 2 - 40 * scale);

    // Score
    ctx.fillStyle = '#FFD700';
    ctx.font = `${60 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText('🏆', canvas.width / 2, canvas.height / 2 + 20 * scale);

    ctx.fillStyle = '#222222';
    ctx.font = `bold ${26 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText(`Totaalscore: ${score}`, canvas.width / 2, canvas.height / 2 + 60 * scale);

    if (score >= highScore && score > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText('NIEUW RECORD!', canvas.width / 2, canvas.height / 2 + 90 * scale);
    } else {
        ctx.fillStyle = '#666666';
        ctx.font = `${18 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText(`Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 90 * scale);
    }

    // Opnieuw spelen
    const blink = Math.sin(time * 4) > 0;
    if (blink) {
        const btnW = 320 * scale;
        const btnH = 45 * scale;
        const btnX = canvas.width / 2 - btnW / 2;
        const btnY = canvas.height / 2 + 110 * scale;

        ctx.fillStyle = '#90EE90';
        doodleRect(btnX, btnY, btnW, btnH, 4);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${18 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textBaseline = 'middle';
        ctx.fillText('SPATIE = Opnieuw Spelen', canvas.width / 2, btnY + btnH / 2);
        ctx.textBaseline = 'alphabetic';
    }

    // Decoraties
    ctx.font = `${30 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText('⚓', boxX + 30 * scale, boxY + 40 * scale);
    ctx.fillText('💰', boxX + boxW - 40 * scale, boxY + 40 * scale);
    ctx.fillText('🏴‍☠️', boxX + 30 * scale, boxY + boxH - 20 * scale);
    ctx.fillText('⭐', boxX + boxW - 40 * scale, boxY + boxH - 20 * scale);
}

function drawLeaderboardEntries(startY, maxEntries, scale) {
    const leaderboard = loadLeaderboard();
    const entries = leaderboard.slice(0, maxEntries);

    if (entries.length === 0) {
        ctx.fillStyle = '#999999';
        ctx.font = `italic ${16 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('Nog geen scores...', canvas.width / 2, startY);
        return;
    }

    const lineHeight = 24 * scale;

    entries.forEach((entry, i) => {
        const y = startY + i * lineHeight;
        const rank = i + 1;

        // Medaille kleuren voor top 3
        if (rank === 1) ctx.fillStyle = '#FFD700';
        else if (rank === 2) ctx.fillStyle = '#C0C0C0';
        else if (rank === 3) ctx.fillStyle = '#CD7F32';
        else ctx.fillStyle = '#222222';

        ctx.font = `bold ${17 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';

        // Afkorten van naam als die te lang is
        const displayName = entry.name.length > 12 ? entry.name.substring(0, 12) : entry.name;
        const text = `${rank}. ${displayName} - ${entry.score}`;
        ctx.fillText(text, canvas.width / 2, y);
    });
}

function drawStartScreen() {
    const scale = getScale();
    const time = Date.now() / 1000;
    const leaderboard = loadLeaderboard();
    const hasScores = leaderboard.length > 0;

    // Semi-transparante achtergrond
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grote doodle box voor titel - groter als er scores zijn
    const boxW = 500 * scale;
    const extraH = hasScores ? Math.min(leaderboard.length, 5) * 24 + 50 : 0;
    const boxH = (350 + extraH) * scale;
    const boxX = canvas.width/2 - boxW/2;
    const boxY = canvas.height/2 - boxH/2 - 20 * scale;

    ctx.fillStyle = '#FFF8DC';
    doodleRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();

    // Bereken verticale offset zodat inhoud gecentreerd is in de box
    const contentBaseY = boxY + 80 * scale;

    // Wiebelige titel
    ctx.save();
    ctx.translate(canvas.width/2, contentBaseY);
    ctx.rotate(Math.sin(time * 2) * 0.03);

    ctx.fillStyle = '#222222';
    ctx.font = `bold ${52 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('De Gekke Poppies', 3 * scale, 3 * scale);
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText('De Gekke Poppies', 0, 0);

    ctx.restore();

    // Payoff
    ctx.save();
    ctx.translate(canvas.width/2, contentBaseY + 55 * scale);
    ctx.rotate(1.5 * Math.PI / 180);
    ctx.fillStyle = '#8B4513';
    ctx.font = `italic ${20 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('Ontworpen door Dex en Stan', 0, 0);
    ctx.restore();

    // Knipperend "druk spatie" met doodle box eromheen
    const blink = Math.sin(time * 4) > 0;
    if (blink) {
        const btnW = 320 * scale;
        const btnH = 45 * scale;
        const btnX = canvas.width/2 - btnW/2;
        const btnY = contentBaseY + 105 * scale;

        ctx.fillStyle = '#90EE90';
        doodleRect(btnX, btnY, btnW, btnH, 4);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('>>> DRUK SPATIE <<<', canvas.width/2, btnY + btnH / 2);
        ctx.textBaseline = 'alphabetic';
    }

    // Besturing info
    ctx.fillStyle = '#666666';
    ctx.font = `${16 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillText('← → = Lopen    SPATIE = Springen', canvas.width/2, contentBaseY + 185 * scale);
    ctx.fillText('Spring op vijanden om ze te verslaan!', canvas.width/2, contentBaseY + 210 * scale);

    // Scorebord op startscherm
    if (hasScores) {
        const lbStartY = contentBaseY + 250 * scale;

        // Scorebord titel met doodle lijn
        ctx.fillStyle = '#2d1810';
        ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('Scorebord', canvas.width / 2, lbStartY);

        // Doodle onderstreep lijn
        const lineW = 100 * scale;
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - lineW / 2, lbStartY + 5 * scale);
        ctx.lineTo(canvas.width / 2 + lineW / 2, lbStartY + 5 * scale);
        ctx.stroke();

        drawLeaderboardEntries(lbStartY + 28 * scale, 5, scale);
    }

    // Kleine decoraties
    ctx.textAlign = 'center';
    ctx.font = `${30 * scale}px Patrick Hand, Comic Sans MS`;
    ctx.fillText('⚓', boxX + 30 * scale, boxY + 40 * scale);
    ctx.fillText('💰', boxX + boxW - 40 * scale, boxY + 40 * scale);
    ctx.fillText('🏴‍☠️', boxX + 30 * scale, boxY + boxH - 20 * scale);
    ctx.fillText('⭐', boxX + boxW - 40 * scale, boxY + boxH - 20 * scale);
}

function drawGameOver() {
    const scale = getScale();
    const time = Date.now() / 1000;

    // Semi-transparante achtergrond
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showingLeaderboard) {
        // Toon scorebord na naam invoer
        const leaderboard = loadLeaderboard();
        const entryCount = Math.min(leaderboard.length, 10);
        const boxW = 450 * scale;
        const boxH = (220 + entryCount * 24) * scale;
        const boxX = canvas.width / 2 - boxW / 2;
        const boxY = canvas.height / 2 - boxH / 2;

        ctx.fillStyle = '#FFF8DC';
        doodleRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 5 * scale;
        ctx.stroke();

        // Wiebelige titel
        ctx.save();
        ctx.translate(canvas.width / 2, boxY + 55 * scale);
        ctx.rotate(Math.sin(time * 2) * 0.03);

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${40 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('Scorebord', 3 * scale, 3 * scale);
        ctx.fillStyle = '#8B4513';
        ctx.fillText('Scorebord', 0, 0);
        ctx.restore();

        // Jouw score
        ctx.fillStyle = '#222222';
        ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText(`Jouw score: ${score}`, canvas.width / 2, boxY + 90 * scale);

        // Doodle onderstreep lijn
        const lineW = 160 * scale;
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - lineW / 2, boxY + 100 * scale);
        ctx.lineTo(canvas.width / 2 + lineW / 2, boxY + 100 * scale);
        ctx.stroke();

        // Scorebord entries
        drawLeaderboardEntries(boxY + 125 * scale, 10, scale);

        // Retry knop
        const blink = Math.sin(time * 4) > 0;
        if (blink) {
            const btnW = 280 * scale;
            const btnH = 40 * scale;
            const btnX = canvas.width / 2 - btnW / 2;
            const btnY = boxY + boxH - 55 * scale;

            ctx.fillStyle = '#90EE90';
            doodleRect(btnX, btnY, btnW, btnH, 4);
            ctx.fill();
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            ctx.fillStyle = '#222222';
            ctx.font = `bold ${18 * scale}px Patrick Hand, Comic Sans MS`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SPATIE = Opnieuw', canvas.width / 2, btnY + btnH / 2);
            ctx.textBaseline = 'alphabetic';
        }

        // Decoraties
        ctx.font = `${25 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('🏴‍☠️', boxX + 35 * scale, boxY + 40 * scale);
        ctx.fillText('⭐', boxX + boxW - 45 * scale, boxY + 40 * scale);

    } else if (waitingForName) {
        // Toon game over achtergrond terwijl naam invoer zichtbaar is
        const boxW = 450 * scale;
        const boxH = 200 * scale;
        const boxX = canvas.width/2 - boxW/2;
        const boxY = canvas.height/2 - boxH/2 - 60 * scale;

        ctx.fillStyle = '#FFF8DC';
        doodleRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 5 * scale;
        ctx.stroke();

        // Wiebelige Game Over titel
        ctx.save();
        ctx.translate(canvas.width/2, boxY + 60 * scale);
        ctx.rotate(Math.sin(time * 3) * 0.05);

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${52 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 3 * scale, 3 * scale);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('GAME OVER', 0, 0);
        ctx.restore();

        // Score
        ctx.fillStyle = '#FFD700';
        ctx.font = `${60 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('⭐', canvas.width/2, boxY + 130 * scale);

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${22 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText(`${score}`, canvas.width/2, boxY + 137 * scale);

        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#FF6B6B';
            ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
            ctx.fillText('NIEUW RECORD!', canvas.width/2, boxY + 175 * scale);
        }

        // Verdrietige emoji's
        ctx.font = `${25 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText('😢', boxX + 35 * scale, boxY + 35 * scale);
        ctx.fillText('💀', boxX + boxW - 45 * scale, boxY + 35 * scale);

    } else {
        // Standaard game over scherm (fallback, zou niet bereikt moeten worden)
        const boxW = 450 * scale;
        const boxH = 300 * scale;
        const boxX = canvas.width/2 - boxW/2;
        const boxY = canvas.height/2 - boxH/2;

        ctx.fillStyle = '#FFF8DC';
        doodleRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 5 * scale;
        ctx.stroke();

        // Wiebelige Game Over titel
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2 - 80 * scale);
        ctx.rotate(Math.sin(time * 3) * 0.05);

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${52 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 3 * scale, 3 * scale);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('GAME OVER', 0, 0);
        ctx.restore();

        // Score
        ctx.fillStyle = '#FFD700';
        ctx.font = `${60 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.textAlign = 'center';
        ctx.fillText('⭐', canvas.width/2, canvas.height/2 + 5 * scale);

        ctx.fillStyle = '#222222';
        ctx.font = `bold ${22 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText(`${score}`, canvas.width/2, canvas.height/2 + 12 * scale);

        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#FF6B6B';
            ctx.font = `bold ${20 * scale}px Patrick Hand, Comic Sans MS`;
            ctx.fillText('NIEUW RECORD!', canvas.width/2, canvas.height/2 + 55 * scale);
        } else {
            ctx.fillStyle = '#666666';
            ctx.font = `${18 * scale}px Patrick Hand, Comic Sans MS`;
            ctx.fillText(`Best: ${highScore}`, canvas.width/2, canvas.height/2 + 55 * scale);
        }

        // Retry knop
        const blink = Math.sin(time * 4) > 0;
        if (blink) {
            const btnW = 280 * scale;
            const btnH = 40 * scale;
            const btnX = canvas.width/2 - btnW/2;
            const btnY = canvas.height/2 + 80 * scale;

            ctx.fillStyle = '#90EE90';
            doodleRect(btnX, btnY, btnW, btnH, 4);
            ctx.fill();
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            ctx.fillStyle = '#222222';
            ctx.font = `bold ${18 * scale}px Patrick Hand, Comic Sans MS`;
            ctx.textBaseline = 'middle';
            ctx.fillText('SPATIE = Opnieuw', canvas.width/2, btnY + btnH / 2);
            ctx.textBaseline = 'alphabetic';
        }

        // Verdrietige emoji's
        ctx.font = `${25 * scale}px Patrick Hand, Comic Sans MS`;
        ctx.fillText('😢', boxX + 35 * scale, boxY + 40 * scale);
        ctx.fillText('💀', boxX + boxW - 45 * scale, boxY + 40 * scale);
    }
}

// ============================================
// MAIN LOOP
// ============================================

// HUD: score en level direct op het canvas
function drawHUD() {
    const scale = getScale();
    const padding = 14 * scale;
    const boxH = 34 * scale;
    const fontSize = 20 * scale;
    const cornerRadius = 4 * scale;

    ctx.save();
    ctx.font = `bold ${fontSize}px Patrick Hand, Comic Sans MS`;
    ctx.textBaseline = 'middle';

    // --- Score (linksboven) ---
    const scoreText = `Score: ${score}`;
    const scoreW = ctx.measureText(scoreText).width + 24 * scale;
    const scoreX = padding;
    const scoreY = padding;

    ctx.fillStyle = 'rgba(250, 240, 220, 0.8)';
    doodleRect(scoreX, scoreY, scoreW, boxH, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(45, 24, 16, 0.6)';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.fillStyle = '#2d1810';
    ctx.textAlign = 'left';
    ctx.fillText(scoreText, scoreX + 12 * scale, scoreY + boxH / 2);

    // --- Level (rechtsboven) ---
    const levelText = `Level: ${currentLevel}`;
    const levelW = ctx.measureText(levelText).width + 24 * scale;
    const levelX = canvas.width - padding - levelW;
    const levelY = padding;

    ctx.fillStyle = 'rgba(45, 24, 16, 0.8)';
    doodleRect(levelX, levelY, levelW, boxH, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.fillStyle = '#faf0dc';
    ctx.textAlign = 'left';
    ctx.fillText(levelText, levelX + 12 * scale, levelY + boxH / 2);

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    // Teken platforms
    platforms.forEach(drawPlatform);

    // Teken debris (brokstukken)
    drawDebris();

    // Teken munten
    coins.forEach(drawCoin);

    // Teken kanonnen
    cannons.forEach(drawCannon);

    // Teken kanonskogels
    cannonballs.forEach(drawCannonball);

    // Teken vlag
    drawFlag();

    // Teken vijanden
    enemies.forEach(drawEnemy);

    // Teken speler
    drawPlayer();

    // HUD: score en level op het canvas
    if (gameStarted && gameRunning && !levelComplete && !gameWon) {
        drawHUD();
    }

    if (!gameStarted) {
        drawStartScreen();
    } else if (gameWon) {
        drawGameWon();
    } else if (levelComplete) {
        drawLevelComplete();
    } else if (!gameRunning) {
        drawGameOver();
    }
}

// Fixed timestep: physics draait altijd op 60 ticks/s, ongeacht scherm-framerate
const FIXED_DT = 1000 / 60;
let lastTime = 0;
let accumulator = 0;

function gameLoop(timestamp) {
    if (lastTime === 0) lastTime = timestamp;
    const elapsed = Math.min(timestamp - lastTime, 200); // Cap om spiraal te voorkomen
    lastTime = timestamp;
    accumulator += elapsed;

    while (accumulator >= FIXED_DT) {
        update();
        accumulator -= FIXED_DT;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// ============================================
// START
// ============================================
resizeCanvas();
scoreDisplay.textContent = 'Score: 0';
levelDisplay.textContent = `Level: ${currentLevel}`;
requestAnimationFrame(gameLoop);

canvas.setAttribute('tabindex', '0');
canvas.focus();
