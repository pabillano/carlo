// ===========================
// COMPLETE GAMES SYSTEM - ALL GAMES WORKING
// ===========================

// Game System Manager
const GameSystem = {
    currentGame: null,
    games: {}
};

// Initialize games when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGameSystem();
});

function initializeGameSystem() {
    const playButtons = document.querySelectorAll('.play-btn');
    const backBtn = document.getElementById('back-btn');

    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const gameName = this.getAttribute('data-game');
            launchGame(gameName);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            closeCurrentGame();
        });
    }
}

function launchGame(gameName) {
    const gameContainer = document.getElementById('game-container');
    const gameContent = document.getElementById('game-content');
    
    gameContainer.style.display = 'flex';
    gameContent.innerHTML = '';

    GameSystem.currentGame = gameName;

    switch(gameName) {
        case 'memory':
            setupMemoryGame();
            break;
        case 'tictactoe':
            setupTicTacToe();
            break;
        case 'snake':
            setupSnakeGame();
            break;
        case 'quiz':
            setupQuizGame();
            break;
        case 'flappy':
            setupFlappyBird();
            break;
        case 'breakout':
            setupBreakoutGame();
            break;
    }
}

function closeCurrentGame() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none';
    
    // Stop any running games
    if (GameSystem.currentGame === 'snake') stopSnakeGame();
    if (GameSystem.currentGame === 'flappy') stopFlappyBird();
    if (GameSystem.currentGame === 'breakout') stopBreakoutGame();
    
    GameSystem.currentGame = null;
}

// ===========================
// MEMORY GAME
// ===========================
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = [];
let memoryMoves = 0;
const memoryEmojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤'];

function setupMemoryGame() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board memory-board">
            <h2>Memory Game</h2>
            <div class="score-display">Moves: <span id="memory-score">0</span></div>
            <div class="memory-grid" id="memory-grid"></div>
            <button class="btn primary-btn" onclick="resetMemoryGame()">Reset Game</button>
        </div>
    `;
    
    gameContent.innerHTML = html;
    resetMemoryGame();
}

function resetMemoryGame() {
    memoryCards = [...memoryEmojis, ...memoryEmojis].sort(() => Math.random() - 0.5);
    memoryFlipped = [];
    memoryMatched = [];
    memoryMoves = 0;
    document.getElementById('memory-score').textContent = '0';
    renderMemoryGame();
}

function renderMemoryGame() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        
        if (memoryFlipped.includes(index) || memoryMatched.includes(index)) {
            card.classList.add('flipped');
            card.textContent = emoji;
        }
        
        if (memoryMatched.includes(index)) {
            card.classList.add('matched');
            card.style.cursor = 'default';
        } else {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => flipMemoryCard(index));
        }
        
        grid.appendChild(card);
    });
}

function flipMemoryCard(index) {
    if (memoryFlipped.includes(index) || memoryMatched.includes(index)) return;
    
    memoryFlipped.push(index);
    renderMemoryGame();

    if (memoryFlipped.length === 2) {
        const [a, b] = memoryFlipped;
        memoryMoves++;
        document.getElementById('memory-score').textContent = memoryMoves;

        if (memoryCards[a] === memoryCards[b]) {
            memoryMatched.push(a, b);
            memoryFlipped = [];
            renderMemoryGame();

            if (memoryMatched.length === memoryCards.length) {
                setTimeout(() => alert(`🎉 You Won! Moves: ${memoryMoves}`), 300);
            }
        } else {
            setTimeout(() => {
                memoryFlipped = [];
                renderMemoryGame();
            }, 800);
        }
    }
}

// ===========================
// TIC TAC TOE
// ===========================
let tttBoard = Array(9).fill('');
let tttCurrentPlayer = 'X';
let tttGameActive = true;

function setupTicTacToe() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board tictactoe-board">
            <h2>Tic Tac Toe</h2>
            <div class="score-display" id="ttt-status">Player X's Turn</div>
            <div class="tictactoe-grid" id="tictactoe-grid"></div>
            <button class="btn primary-btn" onclick="resetTicTacToe()">New Game</button>
        </div>
    `;
    
    gameContent.innerHTML = html;
    resetTicTacToe();
}

function resetTicTacToe() {
    tttBoard = Array(9).fill('');
    tttCurrentPlayer = 'X';
    tttGameActive = true;
    document.getElementById('ttt-status').textContent = "Player X's Turn";
    renderTicTacToe();
}

function renderTicTacToe() {
    const grid = document.getElementById('tictactoe-grid');
    grid.innerHTML = '';

    tttBoard.forEach((value, index) => {
        const cell = document.createElement('button');
        cell.className = 'ttt-cell';
        cell.textContent = value;
        if (value === 'X') cell.style.color = '#667eea';
        if (value === 'O') cell.style.color = '#f093fb';
        
        if (!value && tttGameActive) {
            cell.addEventListener('click', () => playTicTacToe(index));
        } else {
            cell.style.cursor = 'default';
        }
        
        grid.appendChild(cell);
    });
}

function playTicTacToe(index) {
    if (tttBoard[index] !== '' || !tttGameActive) return;

    tttBoard[index] = tttCurrentPlayer;
    
    const winner = checkTicTacToeWinner();
    if (winner) {
        document.getElementById('ttt-status').textContent = `${winner} Wins! 🎉`;
        tttGameActive = false;
    } else if (tttBoard.every(cell => cell !== '')) {
        document.getElementById('ttt-status').textContent = "It's a Draw!";
        tttGameActive = false;
    } else {
        tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('ttt-status').textContent = `Player ${tttCurrentPlayer}'s Turn`;
    }
    
    renderTicTacToe();
}

function checkTicTacToeWinner() {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
        const [a, b, c] = line;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[b] === tttBoard[c]) {
            return tttBoard[a];
        }
    }
    return null;
}

// ===========================
// SNAKE GAME
// ===========================
let snakeGameState = {
    snake: [{x: 10, y: 10}],
    direction: {x: 1, y: 0},
    nextDirection: {x: 1, y: 0},
    food: {x: 15, y: 15},
    score: 0,
    gameLoop: null,
    isActive: false
};

function setupSnakeGame() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board snake-board">
            <h2>Snake Game</h2>
            <div class="score-display">Score: <span id="snake-score">0</span></div>
            <canvas id="snake-canvas" width="400" height="400"></canvas>
            <button class="btn primary-btn" id="snake-start-btn">Start Game</button>
        </div>
    `;
    
    gameContent.innerHTML = html;
    
    document.getElementById('snake-start-btn').addEventListener('click', startSnakeGame);
}

function startSnakeGame() {
    const btn = document.getElementById('snake-start-btn');
    btn.textContent = 'Running...';
    btn.disabled = true;
    
    snakeGameState.snake = [{x: 10, y: 10}];
    snakeGameState.direction = {x: 1, y: 0};
    snakeGameState.nextDirection = {x: 1, y: 0};
    snakeGameState.score = 0;
    snakeGameState.isActive = true;
    
    document.addEventListener('keydown', handleSnakeInput);
    snakeGameState.gameLoop = setInterval(updateSnakeGame, 100);
}

function stopSnakeGame() {
    snakeGameState.isActive = false;
    clearInterval(snakeGameState.gameLoop);
    document.removeEventListener('keydown', handleSnakeInput);
}

function handleSnakeInput(e) {
    if (!snakeGameState.isActive) return;

    switch(e.key) {
        case 'ArrowUp':
            if (snakeGameState.direction.y === 0) snakeGameState.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (snakeGameState.direction.y === 0) snakeGameState.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (snakeGameState.direction.x === 0) snakeGameState.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (snakeGameState.direction.x === 0) snakeGameState.nextDirection = {x: 1, y: 0};
            break;
    }
}

function updateSnakeGame() {
    snakeGameState.direction = snakeGameState.nextDirection;
    
    const head = snakeGameState.snake[0];
    const newHead = {
        x: head.x + snakeGameState.direction.x,
        y: head.y + snakeGameState.direction.y
    };

    if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20) {
        endSnakeGame();
        return;
    }

    for (let i = 0; i < snakeGameState.snake.length; i++) {
        if (newHead.x === snakeGameState.snake[i].x && newHead.y === snakeGameState.snake[i].y) {
            endSnakeGame();
            return;
        }
    }

    snakeGameState.snake.unshift(newHead);

    if (newHead.x === snakeGameState.food.x && newHead.y === snakeGameState.food.y) {
        snakeGameState.score += 10;
        snakeGameState.food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
    } else {
        snakeGameState.snake.pop();
    }

    document.getElementById('snake-score').textContent = snakeGameState.score;
    drawSnakeGame();
}

function endSnakeGame() {
    stopSnakeGame();
    alert(`Game Over! Final Score: ${snakeGameState.score}`);
    document.getElementById('snake-start-btn').textContent = 'Start Game';
    document.getElementById('snake-start-btn').disabled = false;
}

function drawSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff00';
    snakeGameState.snake.forEach(segment => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(snakeGameState.food.x * 20, snakeGameState.food.y * 20, 18, 18);
}

// ===========================
// QUIZ GAME
// ===========================
const quizQuestions = [
    { q: "What is the capital of France?", opts: ["London", "Paris", "Berlin", "Madrid"], ans: 1 },
    { q: "What is 2 + 2?", opts: ["3", "4", "5", "6"], ans: 1 },
    { q: "What is the largest planet?", opts: ["Mars", "Saturn", "Jupiter", "Neptune"], ans: 2 },
    { q: "What is the smallest prime number?", opts: ["1", "2", "3", "5"], ans: 1 },
    { q: "What is the chemical symbol for Gold?", opts: ["Go", "Gd", "Au", "Ag"], ans: 2 },
    { q: "How many continents are there?", opts: ["5", "6", "7", "8"], ans: 2 },
    { q: "What is the speed of light?", opts: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], ans: 0 },
    { q: "What is the most spoken language?", opts: ["Spanish", "English", "Mandarin", "Hindi"], ans: 2 },
    { q: "What year did WWII end?", opts: ["1943", "1944", "1945", "1946"], ans: 2 },
    { q: "What is the deepest ocean?", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3 }
];

let quizState = {
    current: 0,
    score: 0,
    answered: false
};

function setupQuizGame() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board quiz-board">
            <h2>Quiz Game</h2>
            <div class="score-display">Question: <span id="quiz-current">1</span>/<span id="quiz-total">10</span> | Score: <span id="quiz-score">0</span></div>
            <div id="quiz-container"></div>
        </div>
    `;
    
    gameContent.innerHTML = html;
    quizState.current = 0;
    quizState.score = 0;
    quizState.answered = false;
    document.getElementById('quiz-total').textContent = quizQuestions.length;
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = quizQuestions[quizState.current];
    const container = document.getElementById('quiz-container');
    
    let html = `<h3>${question.q}</h3><div class="quiz-options">`;
    
    question.opts.forEach((opt, i) => {
        html += `<button class="quiz-option" onclick="selectQuizAnswer(${i})">${opt}</button>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    document.getElementById('quiz-current').textContent = quizState.current + 1;
    quizState.answered = false;
}

function selectQuizAnswer(index) {
    if (quizState.answered) return;
    quizState.answered = true;

    const question = quizQuestions[quizState.current];
    const buttons = document.querySelectorAll('.quiz-option');

    if (index === question.ans) {
        buttons[index].classList.add('correct');
        quizState.score++;
    } else {
        buttons[index].classList.add('incorrect');
        buttons[question.ans].classList.add('correct');
    }

    document.getElementById('quiz-score').textContent = quizState.score;

    setTimeout(() => {
        quizState.current++;
        if (quizState.current < quizQuestions.length) {
            showQuizQuestion();
        } else {
            alert(`Quiz Complete! Final Score: ${quizState.score}/${quizQuestions.length}`);
        }
    }, 1000);
}

// ===========================
// FLAPPY BIRD
// ===========================
let flappyState = {
    bird: { y: 250, x: 50, width: 20, height: 20, velocity: 0 },
    pipes: [],
    score: 0,
    gameLoop: null,
    isActive: false
};

function setupFlappyBird() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board flappy-board">
            <h2>Flappy Bird</h2>
            <div class="score-display">Score: <span id="flappy-score">0</span></div>
            <canvas id="flappy-canvas" width="400" height="500"></canvas>
            <p class="game-instructions">Press SPACE or Click to Flap</p>
            <button class="btn primary-btn" id="flappy-start-btn">Start Game</button>
        </div>
    `;
    
    gameContent.innerHTML = html;
    document.getElementById('flappy-start-btn').addEventListener('click', startFlappyBird);
}

function startFlappyBird() {
    const btn = document.getElementById('flappy-start-btn');
    btn.textContent = 'Running...';
    btn.disabled = true;

    flappyState.bird = { y: 250, x: 50, width: 20, height: 20, velocity: 0 };
    flappyState.pipes = [];
    flappyState.score = 0;
    flappyState.isActive = true;

    document.addEventListener('keydown', handleFlappyInput);
    document.getElementById('flappy-canvas').addEventListener('click', handleFlappyInput);

    flappyState.gameLoop = setInterval(updateFlappyBird, 30);
}

function stopFlappyBird() {
    flappyState.isActive = false;
    clearInterval(flappyState.gameLoop);
    document.removeEventListener('keydown', handleFlappyInput);
    if (document.getElementById('flappy-canvas')) {
        document.getElementById('flappy-canvas').removeEventListener('click', handleFlappyInput);
    }
}

function handleFlappyInput(e) {
    if (!flappyState.isActive) return;
    if (e.key === ' ' || e.type === 'click') {
        e.preventDefault();
        flappyState.bird.velocity = -8;
    }
}

function updateFlappyBird() {
    flappyState.bird.velocity += 0.4;
    flappyState.bird.y += flappyState.bird.velocity;

    if (flappyState.bird.y + flappyState.bird.height > 500 || flappyState.bird.y < 0) {
        endFlappyBird();
        return;
    }

    if (Math.random() < 0.01) {
        const gapSize = 100;
        const pipeY = Math.random() * (300 - gapSize);
        flappyState.pipes.push({
            x: 400,
            topHeight: pipeY,
            bottomY: pipeY + gapSize,
            passed: false
        });
    }

    flappyState.pipes = flappyState.pipes.filter(p => p.x > -50);

    flappyState.pipes.forEach(pipe => {
        pipe.x -= 5;

        if (!pipe.passed && pipe.x < flappyState.bird.x) {
            pipe.passed = true;
            flappyState.score++;
            document.getElementById('flappy-score').textContent = flappyState.score;
        }

        if (flappyState.bird.x < pipe.x + 50 && flappyState.bird.x + flappyState.bird.width > pipe.x) {
            if (flappyState.bird.y < pipe.topHeight || flappyState.bird.y + flappyState.bird.height > pipe.bottomY) {
                endFlappyBird();
            }
        }
    });

    drawFlappyBird();
}

function endFlappyBird() {
    stopFlappyBird();
    alert(`Game Over! Score: ${flappyState.score}`);
    document.getElementById('flappy-start-btn').textContent = 'Start Game';
    document.getElementById('flappy-start-btn').disabled = false;
}

function drawFlappyBird() {
    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(flappyState.bird.x, flappyState.bird.y, flappyState.bird.width, flappyState.bird.height);

    ctx.fillStyle = '#228b22';
    flappyState.pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, 50, canvas.height - pipe.bottomY);
    });
}

// ===========================
// BREAKOUT GAME
// ===========================
let breakoutState = {
    paddle: { x: 225, y: 280, width: 50, height: 10 },
    ball: { x: 250, y: 250, radius: 5, vx: 4, vy: -4 },
    bricks: [],
    score: 0,
    gameLoop: null,
    isActive: false
};

function setupBreakoutGame() {
    const gameContent = document.getElementById('game-content');
    
    const html = `
        <div class="game-board breakout-board">
            <h2>Brick Breaker</h2>
            <div class="score-display">Score: <span id="breakout-score">0</span></div>
            <canvas id="breakout-canvas" width="500" height="300"></canvas>
            <p class="game-instructions">Use Mouse to move paddle</p>
            <button class="btn primary-btn" id="breakout-start-btn">Start Game</button>
        </div>
    `;
    
    gameContent.innerHTML = html;
    document.getElementById('breakout-start-btn').addEventListener('click', startBreakoutGame);
}

function startBreakoutGame() {
    const btn = document.getElementById('breakout-start-btn');
    btn.textContent = 'Running...';
    btn.disabled = true;

    breakoutState.paddle = { x: 225, y: 280, width: 50, height: 10 };
    breakoutState.ball = { x: 250, y: 250, radius: 5, vx: 4, vy: -4 };
    breakoutState.score = 0;
    breakoutState.isActive = true;
    breakoutState.bricks = [];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            breakoutState.bricks.push({
                x: col * 60,
                y: row * 20 + 20,
                width: 55,
                height: 15,
                active: true
            });
        }
    }

    document.getElementById('breakout-canvas').addEventListener('mousemove', handleBreakoutMouseMove);
    breakoutState.gameLoop = setInterval(updateBreakoutGame, 30);
}

function stopBreakoutGame() {
    breakoutState.isActive = false;
    clearInterval(breakoutState.gameLoop);
    if (document.getElementById('breakout-canvas')) {
        document.getElementById('breakout-canvas').removeEventListener('mousemove', handleBreakoutMouseMove);
    }
}

function handleBreakoutMouseMove(e) {
    if (!breakoutState.isActive) return;
    const canvas = document.getElementById('breakout-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    breakoutState.paddle.x = Math.max(0, Math.min(x - breakoutState.paddle.width / 2, 500 - breakoutState.paddle.width));
}

function updateBreakoutGame() {
    breakoutState.ball.x += breakoutState.ball.vx;
    breakoutState.ball.y += breakoutState.ball.vy;

    if (breakoutState.ball.x - breakoutState.ball.radius < 0 || breakoutState.ball.x + breakoutState.ball.radius > 500) {
        breakoutState.ball.vx *= -1;
    }

    if (breakoutState.ball.y - breakoutState.ball.radius < 0) {
        breakoutState.ball.vy *= -1;
    }

    if (breakoutState.ball.y - breakoutState.ball.radius > 300) {
        endBreakoutGame();
        return;
    }

    if (breakoutState.ball.y + breakoutState.ball.radius > breakoutState.paddle.y &&
        breakoutState.ball.x > breakoutState.paddle.x &&
        breakoutState.ball.x < breakoutState.paddle.x + breakoutState.paddle.width) {
        breakoutState.ball.vy *= -1;
        breakoutState.ball.y = breakoutState.paddle.y - breakoutState.ball.radius;
    }

    breakoutState.bricks.forEach(brick => {
        if (!brick.active) return;

        if (breakoutState.ball.x > brick.x && breakoutState.ball.x < brick.x + brick.width &&
            breakoutState.ball.y > brick.y && breakoutState.ball.y < brick.y + brick.height) {
            brick.active = false;
            breakoutState.ball.vy *= -1;
            breakoutState.score += 10;
            document.getElementById('breakout-score').textContent = breakoutState.score;
        }
    });

    if (breakoutState.bricks.every(b => !b.active)) {
        endBreakoutGame();
        return;
    }

    drawBreakoutGame();
}

function endBreakoutGame() {
    stopBreakoutGame();
    alert(`Game Over! Score: ${breakoutState.score}`);
    document.getElementById('breakout-start-btn').textContent = 'Start Game';
    document.getElementById('breakout-start-btn').disabled = false;
}

function drawBreakoutGame() {
    const canvas = document.getElementById('breakout-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(breakoutState.paddle.x, breakoutState.paddle.y, breakoutState.paddle.width, breakoutState.paddle.height);

    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(breakoutState.ball.x, breakoutState.ball.y, breakoutState.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    breakoutState.bricks.forEach(brick => {
        if (brick.active) {
            ctx.fillStyle = '#667eea';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}
