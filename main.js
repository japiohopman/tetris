"use strict";
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");
nextCtx.scale(20, 20);
const holdCanvas = document.getElementById("hold");
const holdCtx = holdCanvas.getContext("2d");
holdCtx.scale(20, 20);
const scoreElem = document.getElementById("score");
const levelDisplayElem = document.getElementById("level");
const linesElem = document.getElementById("lines");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const startGameBtn = document.getElementById("start-game-btn");
const optionsBtn = document.getElementById("options-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreElem = document.getElementById("final-score");
const playerNameInput = document.getElementById("player-name");
const playAgainBtn = document.getElementById("play-again-btn");
const mainMenuBtn = document.getElementById("main-menu-btn");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const leaderboardList = document.getElementById("leaderboard-list");
const clearLeaderboardBtn = document.getElementById("clear-leaderboard-btn");
const leaderboardMainMenuBtn = document.getElementById("leaderboard-main-menu-btn");
const optionsScreen = document.getElementById("options-screen");
const musicVolumeSlider = document.getElementById("music-volume");
const sfxVolumeSlider = document.getElementById("sfx-volume");
const optionsBackBtn = document.getElementById("options-back-btn");
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.style.display = 'flex';
            setTimeout(() => {
                screen.classList.remove('hidden');
            }, 10);
        }
        else {
            screen.classList.add('hidden');
            setTimeout(() => {
                screen.style.display = 'none';
            }, 500); // Match CSS transition duration
        }
    });
}
const levels = [
    {
        id: 1,
        music: 'assets/music/Tetris_lv1.mp3',
        background: 'assets/backgrounds/rusland_red_square_teteris_level1.png',
        speed: 1000,
        scoreToNextLevel: 1000
    },
    {
        id: 2,
        music: 'assets/music/Tetris_lv2.mp3',
        background: 'assets/backgrounds/usa_level2.png',
        speed: 800,
        scoreToNextLevel: 2500
    },
    {
        id: 3,
        music: 'assets/music/Tetris_lv3.mp3',
        background: 'assets/backgrounds/egypte_level3.png',
        speed: 700,
        scoreToNextLevel: 4000
    },
    {
        id: 4,
        music: 'assets/music/Tetris_lv4.mp3',
        background: 'assets/backgrounds/japan_level5.png',
        speed: 600,
        scoreToNextLevel: 6000
    },
    {
        id: 5,
        music: 'assets/music/Tetris_lv5.mp3',
        background: 'assets/backgrounds/england_level5.png',
        speed: 500,
        scoreToNextLevel: 8000
    },
    {
        id: 6,
        music: 'assets/music/Tetris_lv6.mp3',
        background: 'assets/backgrounds/france_level6.png',
        speed: 400,
        scoreToNextLevel: 10000
    }
];
class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.sfx = {};
        this.sfxVolume = 0.7; // Default SFX volume
        this.loadSfx();
    }
    loadSfx() {
        this.sfx.move = new Audio('assets/sounds/move.mp3');
        this.sfx.rotate = new Audio('assets/sounds/rotate.mp3');
        this.sfx.softDrop = new Audio('assets/sounds/softdrop.mp3');
        this.sfx.hardDrop = new Audio('assets/sounds/harddrop.mp3');
        this.sfx.lock = new Audio('assets/sounds/lock.mp3');
        this.sfx.lineClear = new Audio('assets/sounds/lineclear.mp3');
        this.sfx.tetris = new Audio('assets/sounds/tetris.mp3');
        this.sfx.gameOver = new Audio('assets/sounds/gameover.mp3');
        this.sfx.levelUp = new Audio('assets/sounds/levelup.mp3');
        this.sfx.buttonClick = new Audio('assets/sounds/buttonclick.mp3');
        for (const key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    }
    playMusic(filePath) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        this.currentAudio = new Audio(filePath);
        this.currentAudio.loop = true;
        this.currentAudio.volume = 0.5;
        this.currentAudio.play().catch(error => {
            console.warn("Autoplay prevented:", error);
        });
    }
    stopMusic() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    }
    setVolume(volume) {
        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }
    }
    playSfx(sfxName) {
        if (this.sfx[sfxName]) {
            this.sfx[sfxName].currentTime = 0; // Rewind to start
            this.sfx[sfxName].play().catch(error => {
                console.warn(`SFX autoplay prevented for ${sfxName}:`, error);
            });
        }
    }
    setSfxVolume(volume) {
        this.sfxVolume = volume;
        for (const key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    }
}
class LevelManager {
    constructor(levelDisplayElemId, audioManager) {
        this.currentLevelIndex = 0;
        this.levelDisplayElem = document.getElementById(levelDisplayElemId);
        this.audioManager = audioManager;
        this.updateLevelDisplay();
    }
    getCurrentLevel() {
        return levels[this.currentLevelIndex];
    }
    updateLevel(currentScore) {
        const nextLevel = levels[this.currentLevelIndex + 1];
        if (nextLevel && currentScore >= nextLevel.scoreToNextLevel) {
            this.currentLevelIndex++;
            this.applyLevelSettings();
            this.updateLevelDisplay();
            this.audioManager.playSfx('levelUp');
            console.log(`Advanced to Level ${this.getCurrentLevel().id}`);
        }
    }
    applyLevelSettings() {
        const level = this.getCurrentLevel();
        dropInterval = level.speed;
        this.audioManager.playMusic(level.music);
        document.body.style.backgroundImage = `url('${level.background}')`;
        gameScreen.className = 'screen hidden'; // Reset classes
        gameScreen.classList.add(`level-${level.id}`);
    }
    updateLevelDisplay() {
        this.levelDisplayElem.textContent = `Level: ${this.getCurrentLevel().id}`;
    }
}
const arenaWidth = 12;
const arenaHeight = 20;
const arena = createMatrix(arenaWidth, arenaHeight);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let lines = 0;
let nextPiece = createPiece(randomPieceType());
let holdPiece = null;
let canHold = true;
let shakeAmount = 0; // For screen shake effect
// For line clear animation
let flashLines = [];
let clearedBlocks = [];
let lockParticles = [];
const player = {
    pos: { x: 0, y: 0 },
    matrix: createPiece(randomPieceType())
};
function createMatrix(w, h) {
    const matrix = [];
    while (h--)
        matrix.push(new Array(w).fill(0));
    return matrix;
}
function createPiece(type) {
    if (type === 'T') {
        return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    }
    else if (type === 'O') {
        return [[2, 2], [2, 2]];
    }
    else if (type === 'L') {
        return [[0, 0, 3], [3, 3, 3], [0, 0, 0]];
    }
    else if (type === 'J') {
        return [[4, 0, 0], [4, 4, 4], [0, 0, 0]];
    }
    else if (type === 'I') {
        return [[0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
    else if (type === 'S') { // Added missing S piece
        return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    }
    else if (type === 'Z') { // Added missing Z piece
        return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }
    return [];
}
function randomPieceType() {
    const pieces = 'TJLOSZI';
    return pieces[Math.floor(Math.random() * pieces.length)];
}
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
                // Generate lock particles
                lockParticles.push({
                    x: x + player.pos.x,
                    y: y + player.pos.y,
                    color: ["#000", "#FF0", "#0FF", "#F0F", "#0F0", "#F00", "#00F", "#FFA500"][value],
                    alpha: 1.0,
                    vx: (Math.random() - 0.5) * 0.2, // Small random velocity
                    vy: (Math.random() - 0.5) * 0.2
                });
            }
        });
    });
    audioManager.playSfx('lock');
}
function playerDrop() {
    player.pos.y++;
    audioManager.playSfx('softDrop');
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        levelManager.updateLevel(score); // Update level after score
    }
    dropCounter = 0;
}
function playerHardDrop() {
    audioManager.playSfx('hardDrop');
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    levelManager.updateLevel(score);
    dropCounter = 0;
    shakeAmount = 5; // Set initial shake amount
}
function playerMove(dir) {
    player.pos.x += dir;
    audioManager.playSfx('move');
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}
function playerReset() {
    player.matrix = nextPiece;
    nextPiece = createPiece(randomPieceType());
    player.pos.y = 0;
    player.pos.x = Math.floor(arenaWidth / 2) - Math.floor(player.matrix[0].length / 2);
    canHold = true;
    if (collide(arena, player)) {
        gameOver();
    }
}
function gameOver() {
    gameRunning = false;
    showScreen('game-over-screen');
    finalScoreElem.textContent = score.toString();
    audioManager.stopMusic();
    audioManager.playSfx('gameOver');
}
function playAgain() {
    arena.forEach(row => row.fill(0));
    score = 0;
    lines = 0;
    showScreen('game-screen');
    startGame();
}
playAgainBtn.addEventListener('click', playAgain);
mainMenuBtn.addEventListener('click', () => {
    showScreen('start-screen');
    audioManager.stopMusic();
});
function saveScore(name, score) {
    const scores = loadScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score); // Sort descending
    localStorage.setItem('tetrisLeaderboard', JSON.stringify(scores.slice(0, 10))); // Keep top 10
}
function loadScores() {
    const scoresString = localStorage.getItem('tetrisLeaderboard');
    return scoresString ? JSON.parse(scoresString) : [];
}
function displayLeaderboard() {
    leaderboardList.innerHTML = ''; // Clear previous entries
    const scores = loadScores();
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet. Play a game!</li>';
        return;
    }
    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}
function clearLeaderboard() {
    localStorage.removeItem('tetrisLeaderboard');
    displayLeaderboard(); // Refresh display
}
function saveVolumeSettings(settings) {
    localStorage.setItem('volumeSettings', JSON.stringify(settings));
}
function loadVolumeSettings() {
    const settingsString = localStorage.getItem('volumeSettings');
    return settingsString ? JSON.parse(settingsString) : { music: 0.5, sfx: 0.7 }; // Default values
}
function applyVolumeSettings() {
    const settings = loadVolumeSettings();
    audioManager.setVolume(settings.music);
    audioManager.setSfxVolume(settings.sfx);
    musicVolumeSlider.value = settings.music.toString();
    sfxVolumeSlider.value = settings.sfx.toString();
}
// Event listeners for options screen
musicVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    audioManager.setVolume(volume);
    saveVolumeSettings(Object.assign(Object.assign({}, loadVolumeSettings()), { music: volume }));
});
sfxVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    audioManager.setSfxVolume(volume);
    saveVolumeSettings(Object.assign(Object.assign({}, loadVolumeSettings()), { sfx: volume }));
});
optionsBackBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});
// Event listeners for leaderboard buttons
clearLeaderboardBtn.addEventListener('click', () => { audioManager.playSfx('buttonClick'); clearLeaderboard(); });
leaderboardMainMenuBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});
// Modify game over logic to save score
playAgainBtn.addEventListener('click', () => { audioManager.playSfx('buttonClick'); playAgain(); });
mainMenuBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        saveScore(playerName, score);
    }
    showScreen('start-screen');
    audioManager.stopMusic();
});
// Add event listener for leaderboard button on start screen
leaderboardBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});
// Add event listener for options button on start screen
optionsBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('options-screen');
    applyVolumeSettings(); // Load and apply settings when opening options
});
function playerRotate(dir) {
    audioManager.playSfx('rotate');
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0)
        matrix.forEach(row => row.reverse());
    else
        matrix.reverse();
}
function arenaSweep() {
    let linesCleared = 0;
    const clearedBlockParticles = [];
    outer: for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value !== 0)) {
            // Store cleared blocks as particles
            for (let x = 0; x < arena[y].length; x++) {
                if (arena[y][x] !== 0) {
                    clearedBlockParticles.push({
                        x: x,
                        y: y,
                        color: ["#000", "#FF0", "#0FF", "#F0F", "#0F0", "#F00", "#00F", "#FFA500"][arena[y][x]],
                        alpha: 1.0,
                        vx: (Math.random() - 0.5) * 0.5, // Random horizontal velocity
                        vy: (Math.random() - 0.5) * 0.5 // Random vertical velocity
                    });
                }
            }
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        const linePoints = [0, 40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
        score += linePoints[linesCleared] * (levelManager.getCurrentLevel().id);
        lines += linesCleared;
        if (linesCleared === 4) {
            audioManager.playSfx('tetris');
        }
        else {
            audioManager.playSfx('lineClear');
        }
        clearedBlocks.push(...clearedBlockParticles);
    }
}
function updateScore() {
    scoreElem.textContent = `Score: ${score}`;
    linesElem.textContent = `Lines: ${lines}`;
}
function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = ["#000", "#FF0", "#0FF", "#F0F", "#0F0", "#F00", "#00F", "#FFA500"][value];
                ctx.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}
function drawGhostMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'rgba(255, 255, 255, 0.2)';
                context.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}
function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(Math.random() * shakeAmount - shakeAmount / 2, Math.random() * shakeAmount - shakeAmount / 2);
    drawMatrix(arena, { x: 0, y: 0 });
    const ghostPos = { x: player.pos.x, y: player.pos.y };
    while (!collide(arena, { matrix: player.matrix, pos: ghostPos })) {
        ghostPos.y++;
    }
    ghostPos.y--;
    drawGhostMatrix(player.matrix, ghostPos);
    drawMatrix(player.matrix, player.pos);
    clearedBlocks.forEach(particle => {
        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 1, 1);
        context.restore();
    });
    lockParticles.forEach(particle => {
        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 1, 1);
        context.restore();
    });
    context.restore();
    nextCtx.fillStyle = "#000";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece, { x: 1, y: 1 }, nextCtx);
    holdCtx.fillStyle = "#000";
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdPiece)
        drawMatrix(holdPiece, { x: 1, y: 1 }, holdCtx);
}
function update(time = 0) {
    if (!gameRunning)
        return;
    const deltaTime = time - lastTime;
    lastTime = time;
    if (shakeAmount > 0) {
        shakeAmount -= deltaTime / 100;
        if (shakeAmount < 0)
            shakeAmount = 0;
    }
    for (let i = clearedBlocks.length - 1; i >= 0; i--) {
        const particle = clearedBlocks[i];
        particle.x += particle.vx * deltaTime / 1000;
        particle.y += particle.vy * deltaTime / 1000;
        particle.alpha -= deltaTime / 500;
        if (particle.alpha <= 0) {
            clearedBlocks.splice(i, 1);
        }
    }
    for (let i = lockParticles.length - 1; i >= 0; i--) {
        const particle = lockParticles[i];
        particle.x += particle.vx * deltaTime / 1000;
        particle.y += particle.vy * deltaTime / 1000;
        particle.alpha -= deltaTime / 500;
        if (particle.alpha <= 0) {
            lockParticles.splice(i, 1);
        }
    }
    dropCounter += deltaTime;
    if (dropCounter > dropInterval)
        playerDrop();
    const parallaxSpeed = 0.05;
    const backgroundY = player.pos.y * parallaxSpeed;
    document.body.style.backgroundPositionY = `${backgroundY}px`;
    draw();
    requestAnimationFrame(update);
}
function performHold() {
    if (canHold) {
        if (holdPiece) {
            [player.matrix, holdPiece] = [holdPiece, player.matrix];
        }
        else {
            holdPiece = player.matrix;
            playerReset();
        }
        player.pos.y = 0;
        player.pos.x = Math.floor(arenaWidth / 2) - Math.floor(player.matrix[0].length / 2);
        canHold = false;
    }
}
function togglePause() {
    if (gameRunning) {
        gameRunning = false;
        if (audioManager.currentAudio && !audioManager.currentAudio.paused) {
            audioManager.currentAudio.pause();
        }
    }
    else {
        gameRunning = true;
        if (audioManager.currentAudio && audioManager.currentAudio.paused) {
            audioManager.currentAudio.play();
        }
        update();
    }
}
function setupTouchControls() {
    const controls = document.getElementById('touch-controls');
    if (!controls)
        return;
    const lastActionTs = {};
    const tapCooldownMs = 200; // 200ms cooldown
    const canTrigger = (action) => {
        const now = Date.now();
        const last = lastActionTs[action] || 0;
        if (now - last < tapCooldownMs)
            return false;
        lastActionTs[action] = now;
        return true;
    };
    controls.addEventListener('click', (ev) => {
        const target = ev.target;
        const action = target.getAttribute('data-action');
        if (!action || !canTrigger(action))
            return;
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms
        }
        switch (action) {
            case 'left':
                playerMove(-1);
                break;
            case 'right':
                playerMove(1);
                break;
            case 'down':
                playerDrop();
                break;
            case 'drop':
                playerHardDrop();
                break;
            case 'rotate':
                playerRotate(1);
                break;
            case 'hold':
                performHold();
                break;
            case 'start':
                togglePause();
                break;
            case 'select':
                console.log('Select pressed');
                break;
        }
    });
    const disableContext = (el) => el && el.addEventListener('contextmenu', e => e.preventDefault());
    disableContext(controls);
    disableContext(canvas);
    let holdTimer = null;
    let repeatInterval = null;
    const startRepeat = (fn) => {
        fn();
        holdTimer = window.setTimeout(() => {
            repeatInterval = window.setInterval(fn, 160);
        }, 450);
    };
    const stopRepeat = () => {
        if (holdTimer)
            clearTimeout(holdTimer);
        if (repeatInterval)
            clearInterval(repeatInterval);
        holdTimer = null;
        repeatInterval = null;
    };
    controls.addEventListener('pointerdown', (ev) => {
        const target = ev.target;
        const action = target.getAttribute('data-action');
        if (!action)
            return;
        ev.preventDefault();
        switch (action) {
            case 'left':
                startRepeat(() => playerMove(-1));
                break;
            case 'right':
                startRepeat(() => playerMove(1));
                break;
            case 'down':
                startRepeat(() => playerDrop());
                break;
        }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
        controls.addEventListener(type, stopRepeat);
    });
}
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")
        playerMove(-1);
    else if (e.key === "ArrowRight")
        playerMove(1);
    else if (e.key === "ArrowDown")
        playerDrop();
    else if (e.code === "Space")
        playerHardDrop();
    else if (e.key === "q")
        playerRotate(-1);
    else if (e.key === "w")
        playerRotate(1);
    else if (e.key === "Shift")
        performHold();
});
const audioManager = new AudioManager();
const levelManager = new LevelManager("level", audioManager);
let gameRunning = false; // Flag to control game loop
function startGame() {
    gameRunning = true;
    arena.forEach(row => row.fill(0)); // Clear arena
    score = 0;
    lines = 0;
    playerReset();
    updateScore();
    levelManager.applyLevelSettings();
    update();
}
// Initial setup
showScreen('start-screen');
setupTouchControls(); // Initialize touch controls
startGameBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('game-screen');
    startGame();
});
optionsBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('options-screen');
    applyVolumeSettings();
});
leaderboardBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});