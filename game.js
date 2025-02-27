const gameContainer = document.getElementById('gameContainer');
const menu = document.getElementById('menu');
const background = document.getElementById('background');
const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');
const player = document.getElementById('player');
const obstaclesDiv = document.getElementById('obstacles');
const powerUpsDiv = document.getElementById('powerUps');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');
const pauseBtn = document.getElementById('pauseBtn');

let score = 0;
let lives = 5;
let level = 1;
let isPaused = false;
let playerX = window.innerWidth / 2 - 60; // Adjusted for larger player size
let playerY = window.innerHeight * 0.8;
let speed = 5;
let isShielded = false;
let gameLoop;
let obstacleInterval;
let powerUpInterval;

background.classList.add('menu-active'); // Start with blurred background

function startGame() {
    menu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    background.classList.remove('menu-active');
    background.classList.add('game-active');
    score = 0;
    lives = 5;
    level = 1;
    updateHUD();
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    gameLoop = requestAnimationFrame(updateGame);
    obstacleInterval = setInterval(spawnObstacle, 1000);
    powerUpInterval = setInterval(spawnPowerUp, 5000);
}

function exitGame() {
    cancelAnimationFrame(gameLoop);
    clearInterval(obstacleInterval);
    clearInterval(powerUpInterval);
    obstaclesDiv.innerHTML = '';
    powerUpsDiv.innerHTML = '';
    gameContainer.classList.add('hidden');
    menu.classList.remove('hidden');
    background.classList.remove('game-active');
    background.classList.add('menu-active');
}

function updateHUD() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Lives: ${lives}`;
    levelDisplay.textContent = `Level: ${level}`;
}

function spawnObstacle() {
    if (isPaused) return;
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Circular perimeter spawn, targeting player's current position
    const radius = Math.max(window.innerWidth, window.innerHeight) * 0.6;
    const angle = Math.random() * 2 * Math.PI;
    const startX = playerX + radius * Math.cos(angle) - 31.25; // Half of 62.5px
    const startY = playerY + radius * Math.sin(angle) - 31.25;
    const endX = playerX - 31.25; // Target player's current position
    const endY = playerY - 31.25;

    obstacle.style.setProperty('--startX', `${startX}px`);
    obstacle.style.setProperty('--startY', `${startY}px`);
    obstacle.style.setProperty('--endX', `${endX}px`);
    obstacle.style.setProperty('--endY', `${endY}px`);
    obstacle.style.animationDuration = `${Math.max(1, 3 - level * 0.2)}s`;
    
    obstaclesDiv.appendChild(obstacle);
    setTimeout(() => obstacle.remove(), 4000);
}

function spawnPowerUp() {
    if (isPaused || Math.random() < 0.7) return;
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    const type = Math.floor(Math.random() * 3);
    powerUp.dataset.type = type; // 0: Speed, 1: Shield, 2: Life
    powerUp.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    powerUp.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
    powerUp.style.background = type === 0 ? '#00ff00' : type === 1 ? '#ff00ff' : '#ffff00';
    powerUpsDiv.appendChild(powerUp);
    setTimeout(() => powerUp.remove(), 5000);
}

function updateGame() {
    if (isPaused) return;
    score += 1;
    if (score % 500 === 0) levelUp();
    updateHUD();
    movePlayer();
    checkCollisions();
    gameLoop = requestAnimationFrame(updateGame);
}

function levelUp() {
    level += 1;
    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(spawnObstacle, Math.max(300, 1000 - level * 100));
}

function movePlayer() {
    player.style.left = `${Math.max(0, Math.min(playerX, window.innerWidth - 120))}px`; // Adjusted for 120px
    player.style.top = `${Math.max(0, Math.min(playerY, window.innerHeight - 120))}px`;
}

function checkCollisions() {
    const playerRect = player.getBoundingClientRect();

    // Obstacles
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        const obsRect = obstacle.getBoundingClientRect();
        if (checkCollision(playerRect, obsRect) && !isShielded) {
            lives -= 1;
            updateHUD();
            obstacle.remove();
            if (lives <= 0) {
                alert(`Game Over! Final Score: ${score} | Level: ${level}`);
                exitGame();
            }
        }
    });

    // Power-Ups
    const powerUps = document.querySelectorAll('.power-up');
    powerUps.forEach(powerUp => {
        const puRect = powerUp.getBoundingClientRect();
        if (checkCollision(playerRect, puRect)) {
            applyPowerUp(powerUp.dataset.type);
            powerUp.remove();
        }
    });
}

function applyPowerUp(type) {
    if (type == 0) { // Speed Boost
        speed = 10;
        setTimeout(() => speed = 5, 5000);
    } else if (type == 1) { // Shield
        isShielded = true;
        player.classList.add('shielded');
        setTimeout(() => {
            isShielded = false;
            player.classList.remove('shielded');
        }, 5000);
    } else if (type == 2) { // Extra Life
        lives += 1;
        updateHUD();
    }
}

function checkCollision(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// Event Listeners
startBtn.addEventListener('click', startGame);
exitBtn.addEventListener('click', () => window.close());
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

// Mouse
document.addEventListener('mousemove', (e) => {
    playerX = e.clientX - 60; // Adjusted for larger player
    playerY = e.clientY - 60;
});

// Touch
document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    playerX = touch.clientX - 60;
    playerY = touch.clientY - 60;
});

// Keyboard & TV Remote
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'Up': playerY -= speed; break;
        case 'ArrowDown': case 'Down': playerY += speed; break;
        case 'ArrowLeft': case 'Left': playerX -= speed; break;
        case 'ArrowRight': case 'Right': playerX += speed; break;
    }
});