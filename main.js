var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var canvas = document.getElementById("tetris");
var context = canvas.getContext("2d");
context.scale(20, 20);
var nextCanvas = document.getElementById("next");
var nextCtx = nextCanvas.getContext("2d");
nextCtx.scale(20, 20);
var holdCanvas = document.getElementById("hold");
var holdCtx = holdCanvas.getContext("2d");
holdCtx.scale(20, 20);
var scoreElem = document.getElementById("score");
var levelDisplayElem = document.getElementById("level");
var linesElem = document.getElementById("lines");
var startScreen = document.getElementById("start-screen");
var gameScreen = document.getElementById("game-screen");
var startGameBtn = document.getElementById("start-game-btn");
var optionsBtn = document.getElementById("options-btn");
var leaderboardBtn = document.getElementById("leaderboard-btn");
var gameOverScreen = document.getElementById("game-over-screen");
var finalScoreElem = document.getElementById("final-score");
var playerNameInput = document.getElementById("player-name");
var playAgainBtn = document.getElementById("play-again-btn");
var mainMenuBtn = document.getElementById("main-menu-btn");
var leaderboardScreen = document.getElementById("leaderboard-screen");
var leaderboardList = document.getElementById("leaderboard-list");
var clearLeaderboardBtn = document.getElementById("clear-leaderboard-btn");
var leaderboardMainMenuBtn = document.getElementById("leaderboard-main-menu-btn");
var optionsScreen = document.getElementById("options-screen");
var musicVolumeSlider = document.getElementById("music-volume");
var sfxVolumeSlider = document.getElementById("sfx-volume");
var optionsBackBtn = document.getElementById("options-back-btn");
function showScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    screens.forEach(function (screen) {
        if (screen.id === screenId) {
            // This is the target screen, ensure it's visible and not hidden
            screen.style.display = 'flex'; // Or 'block'
            setTimeout(function() {
                screen.classList.remove('hidden');
            }, 10);
        } else {
            // This is another screen, hide it
            screen.classList.add('hidden');
            setTimeout(function () {
                screen.style.display = 'none';
            }, 500);
        }
    });
}
var levels = [
    {
        id: 1,
        music: '../tetris/assets/music/Tetris_lv1.mp3',
        background: '../tetris/assets/backgrounds/rusland_red_square_teteris_level1.png',
        speed: 1000,
        scoreToNextLevel: 0
    },
    {
        id: 2,
        music: '../tetris/assets/music/Tetris_lv2.mp3', // Placeholder
        background: '../tetris/assets/backgrounds/usa_level2.png', // Placeholder
        speed: 800,
        scoreToNextLevel: 1000
    },
    {
        id: 3,
        music: '../tetris/assets/music/Tetris_lv3.mp3',
        background: '../tetris/assets/backgrounds/rusland_red_square_teteris_level1.png',
        speed: 600,
        scoreToNextLevel: 4000
    },
    {
        id: 4,
        music: '../tetris/assets/music/Tetris_lv4.mp3', // Placeholder
        background: '../tetris/assets/backgrounds/rusland_red_square_teteris_level2.png', // Placeholder
        speed: 400,
        scoreToNextLevel: 8000
    },
    // Add more levels as needed
];
var AudioManager = /** @class */ (function () {
    function AudioManager() {
        this.currentAudio = null;
        this.sfx = {};
        this.sfxVolume = 0.7; // Default SFX volume
        this.loadSfx();
    }
    AudioManager.prototype.loadSfx = function () {
        // Placeholder SFX paths - replace with actual paths
        this.sfx.move = new Audio('../tetris/assets/sounds/move.mp3');
        this.sfx.rotate = new Audio('../tetris/assets/sounds/rotate.mp3');
        this.sfx.softDrop = new Audio('../tetris/assets/sounds/softdrop.mp3');
        this.sfx.hardDrop = new Audio('../tetris/assets/sounds/harddrop.mp3');
        this.sfx.lock = new Audio('../tetris/assets/sounds/lock.mp3');
        this.sfx.lineClear = new Audio('../tetris/assets/sounds/lineclear.mp3');
        this.sfx.tetris = new Audio('../tetris/assets/sounds/tetris.mp3');
        this.sfx.gameOver = new Audio('../tetris/assets/sounds/gameover.mp3');
        this.sfx.levelUp = new Audio('../tetris/assets/sounds/levelup.mp3');
        this.sfx.buttonClick = new Audio('../tetris/assets/sounds/buttonclick.mp3');
        for (var key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    };
    AudioManager.prototype.playMusic = function (filePath) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        this.currentAudio = new Audio(filePath);
        this.currentAudio.loop = true;
        this.currentAudio.volume = 0.5;
        this.currentAudio.play().catch(function (error) {
            console.warn("Autoplay prevented:", error);
        });
    };
    AudioManager.prototype.stopMusic = function () {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    };
    AudioManager.prototype.setVolume = function (volume) {
        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }
    };
    AudioManager.prototype.playSfx = function (sfxName) {
        if (this.sfx[sfxName]) {
            this.sfx[sfxName].currentTime = 0; // Rewind to start
            this.sfx[sfxName].play().catch(function (error) {
                console.warn("SFX autoplay prevented for ".concat(sfxName, ":"), error);
            });
        }
    };
    AudioManager.prototype.setSfxVolume = function (volume) {
        this.sfxVolume = volume;
        for (var key in this.sfx) {
            this.sfx[key].volume = this.sfxVolume;
        }
    };
    return AudioManager;
}());
var LevelManager = /** @class */ (function () {
    function LevelManager(levelDisplayElemId, audioManager) {
        this.currentLevelIndex = 0;
        this.levelDisplayElem = document.getElementById(levelDisplayElemId);
        this.audioManager = audioManager;
        this.updateLevelDisplay();
    }
    LevelManager.prototype.getCurrentLevel = function () {
        return levels[this.currentLevelIndex];
    };
    LevelManager.prototype.updateLevel = function (currentScore) {
        var nextLevel = levels[this.currentLevelIndex + 1];
        if (nextLevel && currentScore >= nextLevel.scoreToNextLevel) {
            this.currentLevelIndex++;
            this.applyLevelSettings();
            this.updateLevelDisplay();
            this.audioManager.playSfx('levelUp');
            console.log("Advanced to Level ".concat(this.getCurrentLevel().id));
        }
    };
    LevelManager.prototype.applyLevelSettings = function () {
        var level = this.getCurrentLevel();
        dropInterval = level.speed;
        this.audioManager.playMusic(level.music);
        document.body.style.backgroundImage = "url('".concat(level.background, "')");
    };
    LevelManager.prototype.updateLevelDisplay = function () {
        this.levelDisplayElem.textContent = "Level: ".concat(this.getCurrentLevel().id);
    };
    return LevelManager;
}());
var arenaWidth = 12;
var arenaHeight = 20;
var arena = createMatrix(arenaWidth, arenaHeight);
var dropCounter = 0;
var dropInterval = 1000;
var lastTime = 0;
var score = 0;
var lines = 0;
var nextPiece = createPiece(randomPieceType());
var holdPiece = null;
var canHold = true;
var shakeAmount = 0; // For screen shake effect
// For line clear animation
var flashLines = [];
var clearedBlocks = [];
var lockParticles = [];
var player = {
    pos: { x: 0, y: 0 },
    matrix: createPiece(randomPieceType())
};
function createMatrix(w, h) {
    var matrix = [];
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
    var pieces = 'TJLOSZI';
    return pieces[Math.floor(Math.random() * pieces.length)];
}
function collide(arena, player) {
    var m = player.matrix;
    var o = player.pos;
    for (var y = 0; y < m.length; y++) {
        for (var x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function merge(arena, player) {
    player.matrix.forEach(function (row, y) {
        row.forEach(function (value, x) {
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
    arena.forEach(function (row) { return row.fill(0); });
    score = 0;
    lines = 0;
    showScreen('game-screen');
    startGame();
}
playAgainBtn.addEventListener('click', playAgain);
mainMenuBtn.addEventListener('click', function () {
    showScreen('start-screen');
    audioManager.stopMusic();
});
function saveScore(name, score) {
    var scores = loadScores();
    scores.push({ name: name, score: score });
    scores.sort(function (a, b) { return b.score - a.score; }); // Sort descending
    localStorage.setItem('tetrisLeaderboard', JSON.stringify(scores.slice(0, 10))); // Keep top 10
}
function loadScores() {
    var scoresString = localStorage.getItem('tetrisLeaderboard');
    return scoresString ? JSON.parse(scoresString) : [];
}
function displayLeaderboard() {
    leaderboardList.innerHTML = ''; // Clear previous entries
    var scores = loadScores();
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet. Play a game!</li>';
        return;
    }
    scores.forEach(function (entry, index) {
        var li = document.createElement('li');
        li.textContent = "".concat(index + 1, ". ").concat(entry.name, ": ").concat(entry.score);
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
    var settingsString = localStorage.getItem('volumeSettings');
    return settingsString ? JSON.parse(settingsString) : { music: 0.5, sfx: 0.7 }; // Default values
}
function applyVolumeSettings() {
    var settings = loadVolumeSettings();
    audioManager.setVolume(settings.music);
    audioManager.setSfxVolume(settings.sfx);
    musicVolumeSlider.value = settings.music.toString();
    sfxVolumeSlider.value = settings.sfx.toString();
}
// Event listeners for options screen
musicVolumeSlider.addEventListener('input', function (e) {
    var volume = parseFloat(e.target.value);
    audioManager.setVolume(volume);
    saveVolumeSettings(__assign(__assign({}, loadVolumeSettings()), { music: volume }));
});
sfxVolumeSlider.addEventListener('input', function (e) {
    var volume = parseFloat(e.target.value);
    audioManager.setSfxVolume(volume);
    saveVolumeSettings(__assign(__assign({}, loadVolumeSettings()), { sfx: volume }));
});
optionsBackBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});
// Event listeners for leaderboard buttons
clearLeaderboardBtn.addEventListener('click', function () { audioManager.playSfx('buttonClick'); clearLeaderboard(); });
leaderboardMainMenuBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('start-screen');
});
// Modify game over logic to save score
playAgainBtn.addEventListener('click', function () { audioManager.playSfx('buttonClick'); playAgain(); });
mainMenuBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    var playerName = playerNameInput.value.trim();
    if (playerName) {
        saveScore(playerName, score);
    }
    showScreen('start-screen');
    audioManager.stopMusic();
});
// Add event listener for leaderboard button on start screen
leaderboardBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});
// Add event listener for options button on start screen
optionsBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('options-screen');
    applyVolumeSettings(); // Load and apply settings when opening options
});
function playerRotate(dir) {
    audioManager.playSfx('rotate');
    var pos = player.pos.x;
    var offset = 1;
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
    var _a;
    for (var y = 0; y < matrix.length; ++y) {
        for (var x = 0; x < y; ++x) {
            _a = [matrix[y][x], matrix[x][y]], matrix[x][y] = _a[0], matrix[y][x] = _a[1];
        }
    }
    if (dir > 0)
        matrix.forEach(function (row) { return row.reverse(); });
    else
        matrix.reverse();
}
function arenaSweep() {
    var linesCleared = 0;
    var clearedBlockParticles = [];
    outer: for (var y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(function (value) { return value !== 0; })) {
            // Store cleared blocks as particles
            for (var x = 0; x < arena[y].length; x++) {
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
            var row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            linesCleared++;
            // Trigger animation (old flash, will be replaced by particles)
            // flashLines.push({y: y, alpha: 1.0});
            y++;
        }
    }
    if (linesCleared > 0) {
        var linePoints = [0, 40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
        score += linePoints[linesCleared] * (levelManager.getCurrentLevel().id);
        lines += linesCleared;
        if (linesCleared === 4) {
            audioManager.playSfx('tetris');
        }
        else {
            audioManager.playSfx('lineClear');
        }
        // Add cleared block particles to a global array to be drawn and updated
        clearedBlocks.push.apply(clearedBlocks, clearedBlockParticles);
    }
}
function updateScore() {
    scoreElem.textContent = "Score: ".concat(score);
    linesElem.textContent = "Lines: ".concat(lines);
}
function drawMatrix(matrix, offset, ctx) {
    if (ctx === void 0) { ctx = context; }
    matrix.forEach(function (row, y) {
        row.forEach(function (value, x) {
            if (value !== 0) {
                ctx.fillStyle = ["#000", "#FF0", "#0FF", "#F0F", "#0F0", "#F00", "#00F", "#FFA500"][value];
                ctx.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}
function drawGhostMatrix(matrix, offset) {
    matrix.forEach(function (row, y) {
        row.forEach(function (value, x) {
            if (value !== 0) {
                context.fillStyle = 'rgba(255, 255, 255, 0.2)';
                context.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}
function draw() {
    console.log('draw called'); // Added for debugging
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Apply shake effect
    context.save();
    context.translate(Math.random() * shakeAmount - shakeAmount / 2, Math.random() * shakeAmount - shakeAmount / 2);
    drawMatrix(arena, { x: 0, y: 0 });
    // Draw ghost piece
    var ghostPos = { x: player.pos.x, y: player.pos.y };
    while (!collide(arena, { matrix: player.matrix, pos: ghostPos })) {
        ghostPos.y++;
    }
    ghostPos.y--;
    drawGhostMatrix(player.matrix, ghostPos);
    drawMatrix(player.matrix, player.pos);
    // Draw line clear animation (particles)
    clearedBlocks.forEach(function (particle) {
        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 1, 1);
        context.restore();
    });
    // Draw lock particles
    lockParticles.forEach(function (particle) {
        context.save();
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 1, 1);
        context.restore();
    });
    context.restore(); // Restore context after shake
    nextCtx.fillStyle = "#000";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece, { x: 1, y: 1 }, nextCtx);
    holdCtx.fillStyle = "#000";
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdPiece)
        drawMatrix(holdPiece, { x: 1, y: 1 }, holdCtx);
}
function update(time) {
    if (time === void 0) { time = 0; }
    if (!gameRunning)
        return; // Stop game loop if not running
    var deltaTime = time - lastTime;
    lastTime = time;
    // Decrease shake amount
    if (shakeAmount > 0) {
        shakeAmount -= deltaTime / 100; // Decrease over 100ms
        if (shakeAmount < 0)
            shakeAmount = 0;
    }
    // Update cleared block particles
    for (var i = clearedBlocks.length - 1; i >= 0; i--) {
        var particle = clearedBlocks[i];
        particle.x += particle.vx * deltaTime / 1000; // Move horizontally
        particle.y += particle.vy * deltaTime / 1000; // Move vertically
        particle.alpha -= deltaTime / 500; // Fade out over 500ms
        if (particle.alpha <= 0) {
            clearedBlocks.splice(i, 1);
        }
    }
    // Update lock particles
    for (var i = lockParticles.length - 1; i >= 0; i--) {
        var particle = lockParticles[i];
        particle.x += particle.vx * deltaTime / 1000;
        particle.y += particle.vy * deltaTime / 1000;
        particle.alpha -= deltaTime / 500; // Fade out over 500ms
        if (particle.alpha <= 0) {
            lockParticles.splice(i, 1);
        }
    }
    dropCounter += deltaTime;
    if (dropCounter > dropInterval)
        playerDrop();
    // Update parallax background
    var parallaxSpeed = 0.05; // Adjust for desired parallax effect
    var backgroundY = player.pos.y * parallaxSpeed;
    document.body.style.backgroundPositionY = "".concat(backgroundY, "px");
    draw();
    requestAnimationFrame(update);
}
document.addEventListener("keydown", function (e) {
    var _a;
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
    else if (e.key === "Shift") {
        performHold();
    }
});

function setupTouchControls() {
    var controls = document.getElementById('touch-controls');
    if (!controls)
        return;
    // Button controls
    var lastActionTs = {};
    var tapCooldownMs = 300; // stronger debounce for single-tap actions
    var canTrigger = function(action){
        var now = Date.now();
        var last = lastActionTs[action] || 0;
        if (now - last < tapCooldownMs) return false;
        lastActionTs[action] = now;
        return true;
    };
    controls.addEventListener('click', function (ev) {
        var target = ev.target;
        if (!(target instanceof HTMLElement))
            return;
        var action = target.getAttribute('data-action');
        if (!action)
            return;
        if (action === 'left')
            playerMove(-1);
        else if (action === 'right')
            playerMove(1);
        else if (action === 'down')
            playerDrop();
        else if (action === 'drop') {
            if (canTrigger('drop')) playerHardDrop();
        }
        else if (action === 'rotate') {
            if (canTrigger('rotate')) playerRotate(1);
        }
        else if (action === 'hold') {
            if (canTrigger('hold')) performHold();
        }
        else if (action === 'start') {
            if (canTrigger('start')) togglePause();
        }
        else if (action === 'select') {
            if (canTrigger('select')) console.log('Select pressed');
        }
    });

    // Disable context menu on long-press for canvas and controls
    var disableContext = function (el) { return el && el.addEventListener('contextmenu', function (e) { return e.preventDefault(); }); };
    disableContext(controls);
    disableContext(canvas);

    // Press-and-hold repeat for D-pad and down
    var holdTimer = null;
    var repeatInterval = null;
    var startRepeat = function (fn) {
        fn(); // immediate
        holdTimer = setTimeout(function () {
            repeatInterval = setInterval(fn, 160); // even slower repeat
        }, 450); // even longer initial delay
    };
    var stopRepeat = function () {
        if (holdTimer)
            clearTimeout(holdTimer);
        if (repeatInterval)
            clearInterval(repeatInterval);
        holdTimer = null;
        repeatInterval = null;
    };

    controls.addEventListener('pointerdown', function (ev) {
        var target = ev.target;
        if (!(target instanceof HTMLElement))
            return;
        var action = target.getAttribute('data-action');
        if (!action)
            return;
        ev.preventDefault();
        if (action === 'left')
            startRepeat(function () { return playerMove(-1); });
        else if (action === 'right')
            startRepeat(function () { return playerMove(1); });
        else if (action === 'down')
            startRepeat(function () { return playerDrop(); });
        else if (action === 'rotate')
            playerRotate(1);
        else if (action === 'drop')
            playerHardDrop();
        else if (action === 'hold')
            performHold();
        else if (action === 'start')
            togglePause();
        else if (action === 'select')
            console.log('Select pressed');
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
        controls.addEventListener(type, function () { return stopRepeat(); });
    });

    // Basic swipe/tap gestures on the canvas
    var startX = 0, startY = 0, startTime = 0, moved = false;
    var threshold = 48; // px, require even more movement
    var canvasEl = canvas;
    canvasEl.addEventListener('touchstart', function (e) {
        var t = e.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
        startTime = Date.now();
        moved = false;
    }, { passive: true });
    canvasEl.addEventListener('touchmove', function (e) {
        // Prevent scrolling while interacting
        e.preventDefault();
        var t = e.changedTouches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (!moved) {
            if (Math.abs(dx) > Math.abs(dy) + 8 && Math.abs(dx) > threshold) { // stronger horizontal intent
                playerMove(dx > 0 ? 1 : -1);
                moved = true;
            }
            else if (Math.abs(dy) > Math.abs(dx) + 8 && Math.abs(dy) > threshold && dy > 0) { // stronger vertical intent
                playerDrop();
                moved = true;
            }
            else if (Math.abs(dy) > Math.abs(dx) + 8 && Math.abs(dy) > threshold && dy < 0) { // swipe up -> hold
                // Swipe up -> hold
                performHold();
                moved = true;
            }
        }
    }, { passive: false });
    canvasEl.addEventListener('touchend', function (e) {
        var dt = Date.now() - startTime;
        var t = e.changedTouches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        // Tap = rotate
        if (!moved && Math.abs(dx) < threshold && Math.abs(dy) < threshold && dt < 180) {
            if (canTrigger('rotate')) playerRotate(1);
        }
    });
}
var audioManager = new AudioManager();
var levelManager = new LevelManager("level", audioManager);
var gameRunning = false; // Flag to control game loop
function togglePause() {
    if (gameRunning) {
        gameRunning = false;
        // Pause music if playing
        if (audioManager.currentAudio && !audioManager.currentAudio.paused) {
            audioManager.currentAudio.pause();
        }
    }
    else {
        gameRunning = true;
        // Resume music if loaded
        if (audioManager.currentAudio && audioManager.currentAudio.paused) {
            audioManager.currentAudio.play();
        }
        update();
    }
}
function startGame() {
    gameRunning = true;
    arena.forEach(function (row) { return row.fill(0); }); // Clear arena
    score = 0;
    lines = 0;
    playerReset();
    updateScore();
    levelManager.applyLevelSettings();
    update();
}
// Initial setup
showScreen('start-screen');
setupTouchControls();
startGameBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('game-screen');
    startGame();
});
optionsBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    console.log('Options button clicked'); // Placeholder
});
leaderboardBtn.addEventListener('click', function () {
    audioManager.playSfx('buttonClick');
    showScreen('leaderboard-screen');
    displayLeaderboard();
});
