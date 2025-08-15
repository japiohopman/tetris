const canvas = document.getElementById("tetris") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
context.scale(20, 20);

const nextCanvas = document.getElementById("next") as HTMLCanvasElement;
const nextCtx = nextCanvas.getContext("2d")!;
nextCtx.scale(20, 20);

const holdCanvas = document.getElementById("hold") as HTMLCanvasElement;
const holdCtx = holdCanvas.getContext("2d")!;
holdCtx.scale(20, 20);

const scoreElem = document.getElementById("score")!;
const levelDisplayElem = document.getElementById("level")!;
const linesElem = document.getElementById("lines")!;

const startScreen = document.getElementById("start-screen")!;
const gameScreen = document.getElementById("game-screen")!;
const startGameABtn = document.getElementById("start-game-a-btn")!;
const startGameBBtn = document.getElementById("start-game-b-btn")!;
const optionsBtn = document.getElementById("options-btn")!;
const leaderboardBtn = document.getElementById("leaderboard-btn")!;

const gameOverScreen = document.getElementById("game-over-screen")!;
const finalScoreElem = document.getElementById("final-score")!;
const playerNameInput = document.getElementById("player-name")! as HTMLInputElement;
const playAgainBtn = document.getElementById("play-again-btn")!;
const mainMenuBtn = document.getElementById("main-menu-btn")!;

const leaderboardScreen = document.getElementById("leaderboard-screen")!;
const leaderboardList = document.getElementById("leaderboard-list")!;
const clearLeaderboardBtn = document.getElementById("clear-leaderboard-btn")!;
const leaderboardMainMenuBtn = document.getElementById("leaderboard-main-menu-btn")!;

const optionsScreen = document.getElementById("options-screen")!;
const musicVolumeSlider = document.getElementById("music-volume")! as HTMLInputElement;
const sfxVolumeSlider = document.getElementById("sfx-volume")! as HTMLInputElement;
const optionsBackBtn = document.getElementById("options-back-btn")!;

const levelUpScreen = document.getElementById("level-up-screen")!;
const nextLevelDisplay = document.getElementById("next-level-display")!;

const winScreen = document.getElementById("win-screen")!;
const winScoreElem = document.getElementById("win-score")!;
const winMainMenuBtn = document.getElementById("win-main-menu-btn")!;

let gameMode: 'A' | 'B' = 'A';

function showScreen(screenId: string) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.id === screenId) {
            (screen as HTMLElement).style.display = 'flex';
            setTimeout(() => {
                (screen as HTMLElement).classList.remove('hidden');
                if (screen.id === 'win-screen') {
                    (screen as HTMLElement).classList.add('visible');
                }
            }, 10);
        } else {
            (screen as HTMLElement).classList.add('hidden');
            if (screen.id === 'win-screen') {
                (screen as HTMLElement).classList.remove('visible');
            }
            setTimeout(() => {
                (screen as HTMLElement).style.display = 'none';
            }, 500); 
        }
    });
}

interface LevelSettings {
    background: string;
}

const musicOptions: { [key: string]: string | null } = {
    'A': '../assets/music/Tetris_lv1.mp3',
    'B': '../assets/music/Tetris_lv2.mp3',
    'C': null, 
};
let selectedMusicType: 'A' | 'B' | 'C' = 'A';

const levelThemes: { [key: string]: LevelSettings } = {
    '0-2': { background: '../assets/backgrounds/rusland_red_square_teteris_level1.png' },
    '3-5': { background: '../assets/backgrounds/usa_level2.png' },
    '6-8': { background: '../assets/backgrounds/egypte_level3.png' },
    '9-11': { background: '../assets/backgrounds/japan_level5.png' },
    '12-15': { background: '../assets/backgrounds/england_level5.png' },
    '16-19': { background: '../assets/backgrounds/france_level6.png' },
    '20+': { background: '../assets/backgrounds/france_level6.png' }, 
};

const levelSpeeds = [
    887, 795, 712, 630, 550, 468, 388, 305, 222, 138, 
    100, 100, 100, 84, 84, 84, 67, 67, 67, 50, 50, 50, 50, 50, 50, 50 
];

class AudioManager {
    public currentAudio: HTMLAudioElement | null = null;
    private sfx: {[key: string]: HTMLAudioElement} = {};
    private sfxVolume: number = 0.7;

    constructor() {
        this.loadSfx();
    }

    private loadSfx() {
        this.sfx.move = new Audio('../assets/sounds/move.mp3');
        this.sfx.rotate = new Audio('../assets/sounds/rotate.mp3');
        this.sfx.softDrop = new Audio('../assets/sounds/softdrop.mp3');
        this.sfx.hardDrop = new Audio('../assets/sounds/harddrop.mp3');
        this.sfx.lock = new Audio('../assets/sounds/lock.mp3');
        this.sfx.lineClear = new Audio('../assets/sounds/lineclear.mp3');
        this.sfx.tetris = new Audio('../assets/sounds/tetris.mp3');
        this.sfx.gameOver = new Audio('../assets/sounds/gameover.mp3');
        this.sfx.levelUp = new Audio('../assets/sounds/levelup.mp3');
        this.sfx.buttonClick = new Audio('../assets/sounds/buttonclick.mp3');

        for (const key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    }

    playMusic(musicType: 'A' | 'B' | 'C') {
        this.stopMusic(); 

        const filePath = musicOptions[musicType];
        if (!filePath) {
            return; 
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
            this.currentAudio = null;
        }
    }

    setVolume(volume: number) {
        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }
    }
    
    setPlaybackRate(rate: number) {
        if (this.currentAudio) {
            this.currentAudio.playbackRate = rate;
        }
    }

    playSfx(sfxName: string) {
        if (this.sfx[sfxName]) {
            this.sfx[sfxName].currentTime = 0; 
            this.sfx[sfxName].play().catch(error => {
                console.warn(`SFX autoplay prevented for ${sfxName}:`, error);
            });
        }
    }

    setSfxVolume(volume: number) {
        this.sfxVolume = volume;
        for (const key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    }
}

class LevelManager {
    public level: number = 0;
    private lines: number = 0;
    private levelDisplayElem: HTMLElement;
    private linesDisplayElem: HTMLElement;
    private audioManager: AudioManager;

    constructor(levelDisplayElemId: string, linesDisplayElemId: string, audioManager: AudioManager) {
        this.levelDisplayElem = document.getElementById(levelDisplayElemId)!;
        this.linesDisplayElem = document.getElementById(linesDisplayElemId)!;
        this.audioManager = audioManager;
        this.updateDisplay();
    }

    public getLines(): number {
        return this.lines;
    }

    update(clearedLines: number): boolean {
        if (clearedLines === 0) return false;

        this.lines += clearedLines;
        const previousLevel = this.level;
        this.level = Math.floor(this.lines / 10);

        this.updateDisplay();

        if (this.level > previousLevel) {
            gameRunning = false; 
            this.audioManager.playSfx('levelUp');
            console.log(`Advanced to Level ${this.level}`);
            
            this.showLevelUpAnimation();

            setTimeout(() => {
                this.hideLevelUpAnimation();
                this.applyLevelSettings();
                gameRunning = true; 
                update(); 
            }, 2000); 
            return true; 
        }
        return false; 
    }

    showLevelUpAnimation() {
        nextLevelDisplay.textContent = this.level.toString();
        levelUpScreen.style.display = 'flex';
        setTimeout(() => {
            levelUpScreen.classList.remove('hidden');
        }, 10);
    }

    hideLevelUpAnimation() {
        levelUpScreen.classList.add('hidden');
        setTimeout(() => {
            levelUpScreen.style.display = 'none';
        }, 500); 
    }

    getThemeForLevel(level: number): LevelSettings {
        if (level >= 0 && level <= 2) return levelThemes['0-2'];
        if (level >= 3 && level <= 5) return levelThemes['3-5'];
        if (level >= 6 && level <= 8) return levelThemes['6-8'];
        if (level >= 9 && level <= 11) return levelThemes['9-11'];
        if (level >= 12 && level <= 15) return levelThemes['12-15'];
        if (level >= 16 && level <= 19) return levelThemes['16-19'];
        return levelThemes['20+'];
    }

    applyLevelSettings() {
        const theme = this.getThemeForLevel(this.level);
        
        dropInterval = levelSpeeds[Math.min(this.level, levelSpeeds.length - 1)];

        document.body.style.backgroundImage = `url('${theme.background}')`;
        
        const playbackRate = 1 + (this.level * 0.02);
        this.audioManager.setPlaybackRate(playbackRate);

        this.updateDisplay();
    }

    reset() {
        this.level = 0;
        this.lines = 0;
        this.applyLevelSettings();
        this.updateDisplay();
    }

    updateDisplay() {
        this.levelDisplayElem.textContent = `Level: ${this.level}`;
        this.linesDisplayElem.textContent = `Lines: ${this.lines}`;
    }
}


const arenaWidth = 12;
const arenaHeight = 20;
const arena: number[][] = createMatrix(arenaWidth, arenaHeight);

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let score = 0;
let nextPiece = createPiece(randomPieceType());
let holdPiece: number[][] | null = null;
let canHold = true;
let shakeAmount = 0; 

let flashLines: {y: number, alpha: number}[] = [];
let clearedBlocks: {x: number, y: number, color: string, alpha: number, vx: number, vy: number}[] = [];
let lockParticles: {x: number, y: number, color: string, alpha: number, vx: number, vy: number}[] = [];

const player = {
    pos: {x: 0, y: 0},
    matrix: createPiece(randomPieceType())
};

function createMatrix(w: number, h: number) {
    const matrix: number[][] = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type: string): number[][] {
    if (type === 'T') {
        return [[0,1,0],[1,1,1],[0,0,0]];
    } else if (type === 'O') {
        return [[2,2],[2,2]];
    } else if (type === 'L') {
        return [[0,0,3],[3,3,3],[0,0,0]];
    } else if (type === 'J') {
        return [[4,0,0],[4,4,4],[0,0,0]];
    } else if (type === 'I') {
        return [[0,0,0,0],[5,5,5,5],[0,0,0,0],[0,0,0,0]];
    } else if (type === 'S') { 
        return [[0,6,6],[6,6,0],[0,0,0]];
    } else if (type === 'Z') { 
        return [[7,7,0],[0,7,7],[0,0,0]];
    }
    return [];
}

function randomPieceType() {
    const pieces = 'TJLOSZI';
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function collide(arena: number[][], player: {pos: {x: number, y: number}, matrix: number[][]}) {
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

function merge(arena: number[][], player: {pos: {x: number, y: number}, matrix: number[][]}) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
                lockParticles.push({
                    x: x + player.pos.x,
                    y: y + player.pos.y,
                    color: ["#000","#FF0","#0FF","#F0F","#0F0","#F00","#00F","#FFA500"][value],
                    alpha: 1.0,
                    vx: (Math.random() - 0.5) * 0.2, 
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
    }
    dropCounter = 0;
}

function playerHardDrop() {
    audioManager.playSfx('hardDrop');
    console.log('playerHardDrop: starting, player.pos.y =', player.pos.y);
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    console.log('playerHardDrop: after collision, player.pos.y =', player.pos.y);
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
    shakeAmount = 5; 
}

function playerMove(dir: number) {
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

function gameWon() {
    gameRunning = false;
    showScreen('win-screen');
    winScoreElem.textContent = score.toString();
    audioManager.stopMusic();
    audioManager.playSfx('levelUp'); 
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
    showScreen('game-screen');
    startGame();
}

playAgainBtn.addEventListener('click', playAgain);
mainMenuBtn.addEventListener('click', () => {
    showScreen('start-screen');
    audioManager.stopMusic();
});

interface ScoreEntry {
    name: string;
    score: number;
}

function saveScore(name: string, score: number) {
    const scores = loadScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score); 
    localStorage.setItem('tetrisLeaderboard', JSON.stringify(scores.slice(0, 10))); 
}

function loadScores(): ScoreEntry[] {
    const scoresString = localStorage.getItem('tetrisLeaderboard');
    return scoresString ? JSON.parse(scoresString) : [];
}

function displayLeaderboard() {
    leaderboardList.innerHTML = ''; 
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
    displayLeaderboard(); 
}

interface Settings {
    musicVolume: number;
    sfxVolume: number;
    musicType: 'A' | 'B' | 'C';
}

function saveSettings(settings: Settings) {
    localStorage.setItem('tetrisSettings', JSON.stringify(settings));
}

function loadSettings(): Settings {
    const settingsString = localStorage.getItem('tetrisSettings');
    return settingsString ? JSON.parse(settingsString) : { musicVolume: 0.5, sfxVolume: 0.7, musicType: 'A' }; 
}

function applySettings() {
    const settings = loadSettings();
    audioManager.setVolume(settings.musicVolume);
    audioManager.setSfxVolume(settings.sfxVolume);
    selectedMusicType = settings.musicType;

    musicVolumeSlider.value = settings.musicVolume.toString();
    sfxVolumeSlider.value = settings.sfxVolume.toString();

    document.querySelectorAll('.music-btn').forEach(btn => {
        if (btn.getAttribute('data-music') === selectedMusicType) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

musicVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat((e.target as HTMLInputElement).value);
    audioManager.setVolume(volume);
    const settings = loadSettings();
    settings.musicVolume = volume;
    saveSettings(settings);
});

sfxVolumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat((e.target as HTMLInputElement).value);
    audioManager.setSfxVolume(volume);
    const settings = loadSettings();
    settings.sfxVolume = volume;
    saveSettings(settings);
});

document.querySelectorAll('.music-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const musicType = (e.target as HTMLElement).getAttribute('data-music') as 'A' | 'B' | 'C';
        selectedMusicType = musicType;
        const settings = loadSettings();
        settings.musicType = musicType;
        saveSettings(settings);
        applySettings(); 
        
        if (gameRunning) {
            audioManager.playMusic(selectedMusicType);
        }
    });
});

optionsBackBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});

clearLeaderboardBtn.addEventListener('click', () => { audioManager.playSfx('buttonClick'); clearLeaderboard(); });
leaderboardMainMenuBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});

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

leaderboardBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});

optionsBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('options-screen');
    applySettings(); 
});

function playerRotate(dir: number) {
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

function rotate(matrix: number[][], dir: number) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function arenaSweep() {
    let linesCleared = 0;
    const clearedBlockParticles: {x: number, y: number, color: string, alpha: number, vx: number, vy: number}[] = [];

    outer: for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value !== 0)) {
            for (let x = 0; x < arena[y].length; x++) {
                if (arena[y][x] !== 0) {
                    clearedBlockParticles.push({
                        x: x,
                        y: y,
                        color: ["#000","#FF0","#0FF","#F0F","#0F0","#F00","#00F","#FFA500"][arena[y][x]],
                        alpha: 1.0,
                        vx: (Math.random() - 0.5) * 0.5, 
                        vy: (Math.random() - 0.5) * 0.5  
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
        levelManager.update(linesCleared);
        
        const linePoints = [0, 40, 100, 300, 1200];
        score += linePoints[linesCleared] * (levelManager.level + 1);
        updateScore();

        if (linesCleared === 4) {
            audioManager.playSfx('tetris');
        } else {
            audioManager.playSfx('lineClear');
        }
        clearedBlocks.push(...clearedBlockParticles);

        if (gameMode === 'B' && levelManager.getLines() >= 25) {
            gameWon();
        }
    }
}

function updateScore() {
    scoreElem.textContent = `Score: ${score}`;
}

function drawMatrix(matrix: number[][], offset: {x: number, y: number}, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = ["#000","#FF0","#0FF","#F0F","#0F0","#F00","#00F","#FFA500"][value];
                ctx.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}

function drawGhostMatrix(matrix: number[][], offset: {x: number, y: number}) {
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
    context.translate(Math.random() * shakeAmount - shakeAmount / 2,
                      Math.random() * shakeAmount - shakeAmount / 2);

    drawMatrix(arena, {x: 0, y: 0});

    const ghostPos = {x: player.pos.x, y: player.pos.y};
    while (!collide(arena, {matrix: player.matrix, pos: ghostPos})) {
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
    drawMatrix(nextPiece, {x: 1, y: 1}, nextCtx);

    holdCtx.fillStyle = "#000";
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdPiece) drawMatrix(holdPiece, {x: 1, y: 1}, holdCtx);
}

function update(time = 0) {
    if (!gameRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    if (shakeAmount > 0) {
        shakeAmount -= deltaTime / 100;
        if (shakeAmount < 0) shakeAmount = 0;
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
    if (dropCounter > dropInterval) playerDrop();
    
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
        } else {
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
    } else {
        gameRunning = true;
        if (audioManager.currentAudio && audioManager.currentAudio.paused) {
            audioManager.currentAudio.play();
        }
        update();
    }
}

function setupTouchControls() {
    const controls = document.getElementById('touch-controls');
    if (!controls) return;

    const lastActionTs: { [key: string]: number } = {};
    const tapCooldownMs = 200; 

    const canTrigger = (action: string): boolean => {
        const now = Date.now();
        const last = lastActionTs[action] || 0;
        if (now - last < tapCooldownMs) return false;
        lastActionTs[action] = now;
        return true;
    };

    controls.addEventListener('click', (ev: MouseEvent) => {
        const target = ev.target as HTMLElement;
        const action = target.getAttribute('data-action');
        if (!action || !canTrigger(action)) return;

        switch (action) {
            case 'left': playerMove(-1); break;
            case 'right': playerMove(1); break;
            case 'down': playerDrop(); break;
            case 'drop': playerHardDrop(); break;
            case 'rotate': playerRotate(1); break;
            case 'hold': performHold(); break;
            case 'start': togglePause(); break;
            case 'select': console.log('Select pressed'); break;
        }
    });

    const disableContext = (el: HTMLElement | null) => el && el.addEventListener('contextmenu', e => e.preventDefault());
    disableContext(controls);
    disableContext(canvas);

    let holdTimer: number | null = null;
    let repeatInterval: number | null = null;

    const startRepeat = (fn: () => void) => {
        fn();
        holdTimer = window.setTimeout(() => {
            repeatInterval = window.setInterval(fn, 160);
        }, 450);
    };

    const stopRepeat = () => {
        if (holdTimer) clearTimeout(holdTimer);
        if (repeatInterval) clearInterval(repeatInterval);
        holdTimer = null;
        repeatInterval = null;
    };

    controls.addEventListener('pointerdown', (ev: PointerEvent) => {
        const target = ev.target as HTMLElement;
        const action = target.getAttribute('data-action');
        if (!action) return;
        ev.preventDefault();

        switch (action) {
            case 'left': startRepeat(() => playerMove(-1)); break;
            case 'right': startRepeat(() => playerMove(1)); break;
            case 'down': startRepeat(() => playerDrop()); break;
        }
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
        controls.addEventListener(type, stopRepeat);
    });
}

const DAS_DELAY = 180; 
const AUTO_REPEAT_RATE = 50; 

const keyState: { [key: string]: { pressed: boolean, dasTimer: number | null, dasInterval: number | null } } = {
    ArrowLeft: { pressed: false, dasTimer: null, dasInterval: null },
    ArrowRight: { pressed: false, dasTimer: null, dasInterval: null },
};

function stopDas(key: string) {
    if (keyState[key]) {
        if (keyState[key].dasTimer) clearTimeout(keyState[key].dasTimer!);
        if (keyState[key].dasInterval) clearInterval(keyState[key].dasInterval!);
        keyState[key].pressed = false;
        keyState[key].dasTimer = null;
        keyState[key].dasInterval = null;
    }
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;

    switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
            if (!keyState[e.key].pressed) {
                keyState[e.key].pressed = true;
                playerMove(e.key === "ArrowLeft" ? -1 : 1);
                keyState[e.key].dasTimer = window.setTimeout(() => {
                    keyState[e.key].dasInterval = window.setInterval(() => {
                        playerMove(e.key === "ArrowLeft" ? -1 : 1);
                    }, AUTO_REPEAT_RATE);
                }, DAS_DELAY);
            }
            break;

        case "ArrowDown":
            playerDrop();
            break;

        case "ArrowUp":
            performHold();
            break;

        case " ": 
            playerHardDrop();
            break;

        case "w":
            playerRotate(1);
            break;
        
        case "q": 
            playerRotate(-1);
            break;
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        stopDas(e.key);
    }
});

const audioManager = new AudioManager();
const levelManager = new LevelManager("level", "lines", audioManager);

let gameRunning = false; 

applySettings(); 

function startGame() {
    gameRunning = true;
    arena.forEach(row => row.fill(0)); 
    score = 0;
    playerReset();
    updateScore();
    levelManager.reset();
    audioManager.playMusic(selectedMusicType);
    update();
}

showScreen('start-screen');
setupTouchControls(); 

startGameABtn.addEventListener('click', () => {
    gameMode = 'A';
    audioManager.playSfx('buttonClick');
    showScreen('game-screen');
    startGame();
});

startGameBBtn.addEventListener('click', () => {
    gameMode = 'B';
    audioManager.playSfx('buttonClick');
    showScreen('game-screen');
    startGame();
});

winMainMenuBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
    audioManager.stopMusic();
});

optionsBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('options-screen');
    applySettings(); 
});

leaderboardBtn.addEventListener('click', () => {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});

interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
}

const achievements: Achievement[] = [
    { id: 'first_game', name: 'First Game', description: 'Play your first game of Tetris.', unlocked: false },
    { id: 'level_5', name: 'Level 5', description: 'Reach level 5.', unlocked: false },
    { id: 'tetris_clear', name: 'Tetris!', description: 'Clear 4 lines at once.', unlocked: false },
    { id: 'score_10000', name: 'High Scorer', description: 'Score 10,000 points.', unlocked: false },
];

function unlockAchievement(id: string) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        console.log(`Achievement unlocked: ${achievement.name}`);
        saveAchievements();
    }
}

function saveAchievements() {
    const unlockedAchievements = achievements.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem('tetrisAchievements', JSON.stringify(unlockedAchievements));
}

function loadAchievements() {
    const unlockedIds = JSON.parse(localStorage.getItem('tetrisAchievements') || '[]');
    unlockedIds.forEach((id: string) => {
        const achievement = achievements.find(a => a.id === id);
        if (achievement) {
            achievement.unlocked = true;
        }
    });
}

function displayAchievements() {
    const achievementsList = document.getElementById('achievements-list')!;
    achievementsList.innerHTML = '';
    achievements.forEach(a => {
        const li = document.createElement('li');
        li.textContent = `${a.name}: ${a.description} ${a.unlocked ? '(Unlocked)' : ''}`;
        li.classList.toggle('unlocked', a.unlocked);
        achievementsList.appendChild(li);
    });
}

document.getElementById('achievements-btn')!.addEventListener('click', () => {
    showScreen('achievements-screen');
    displayAchievements();
});

document.getElementById('achievements-back-btn')!.addEventListener('click', () => {
    showScreen('start-screen');
});

loadAchievements();