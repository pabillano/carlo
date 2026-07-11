// Game Management Functions
function openGame(game) {
    const modal = document.getElementById(`game-${game}`);
    if (modal) {
        modal.classList.add('active');
        
        // Initialize game when opened
        if (game === '2048') init2048();
        else if (game === 'tictactoe') initTicTacToe();
        else if (game === 'snake') initSnake();
        else if (game === 'memory') initMemory();
        else if (game === 'flappy') initFlappy();
        else if (game === 'quiz') initQuiz();
        else if (game === 'colorguess') initColorGuess();
        else if (game === 'breakout') initBreakout();
    }
}

function closeGame(game) {
    const modal = document.getElementById(`game-${game}`);
    if (modal) {
        modal.classList.remove('active');
        
        // Stop game loops
        if (game === 'snake' && snakeGameActive) stopSnake();
        if (game === 'flappy' && flappyGameActive) stopFlappy();
        if (game === 'breakout' && breakoutGameActive) stopBreakout();
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('game-modal')) {
        e.target.classList.remove('active');
        // Stop games if active
        if (snakeGameActive) stopSnake();
        if (flappyGameActive) stopFlappy();
        if (breakoutGameActive) stopBreakout();
    }
});

// ===========================
// 2048 GAME
// ===========================
let board2048 = [];
let score2048 = 0;

function init2048() {
    board2048 = Array(16).fill(0);
    score2048 = 0;
    addNew2048Tile();
    addNew2048Tile();
    render2048();
}

function reset2048() {
    init2048();
}

function addNew2048Tile() {
    const empty = board2048.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    if (empty.length > 0) {
        const idx = empty[Math.floor(Math.random() * empty.length)];
        board2048[idx] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move2048(direction) {
    let moved = false;
    const newBoard = [...board2048];

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            const row = newBoard.slice(i * 4, i * 4 + 4);
            const newRow = compress(row, direction === 'right');
            for (let j = 0; j < 4; j++) {
                newBoard[i * 4 + j] = newRow[j];
            }
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const col = [newBoard[i], newBoard[i + 4], newBoard[i + 8], newBoard[i + 12]];
            const newCol = compress(col, direction === 'down');
            newBoard[i] = newCol[0];
            newBoard[i + 4] = newCol[1];
            newBoard[i + 8] = newCol[2];
            newBoard[i + 12] = newCol[3];
        }
    }

    if (JSON.stringify(newBoard) !== JSON.stringify(board2048)) {
        board2048 = newBoard;
        addNew2048Tile();
        moved = true;
    }

    render2048();
    return moved;
}

function compress(arr, reverse) {
    if (reverse) arr = arr.reverse();
    let result = arr.filter(v => v !== 0);
    
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === result[i + 1]) {
            result[i] *= 2;
            score2048 += result[i];
            result.splice(i + 1, 1);
        }
    }
    
    while (result.length < 4) result.push(0);
    if (reverse) result = result.reverse();
    return result;
}

function render2048() {
    const board = document.getElementById('game-board-2048');
    board.innerHTML = '';
    
    board2048.forEach(value => {
        const tile = document.createElement('div');
        tile.className = 'tile-2048';
        if (value !== 0) {
            tile.setAttribute('data-value', value);
            tile.textContent = value;
        }
        board.appendChild(tile);
    });
    
    document.getElementById('score-2048').textContent = score2048;
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('game-2048').classList.contains('active')) {
        if (e.key === 'ArrowLeft') move2048('left');
        if (e.key === 'ArrowRight') move2048('right');
        if (e.key === 'ArrowUp') move2048('up');
        if (e.key === 'ArrowDown') move2048('down');
    }
});

// ===========================
// TIC TAC TOE GAME
// ===========================
let tttBoard = [];
let tttPlayer = 'X';

function initTicTacToe() {
    tttBoard = Array(9).fill('');
    tttPlayer = 'X';
    renderTicTacToe();
}

function resetTicTacToe() {
    initTicTacToe();
}

function playTicTacToe(index) {
    if (tttBoard[index] === '') {
        tttBoard[index] = tttPlayer;
        const winner = checkWinner(tttBoard);
        
        if (winner) {
            document.getElementById('ttt-status').textContent = `${winner} Wins!`;
        } else if (tttBoard.every(cell => cell !== '')) {
            document.getElementById('ttt-status').textContent = "It's a Draw!";
        } else {
            tttPlayer = tttPlayer === 'X' ? 'O' : 'X';
            document.getElementById('ttt-status').textContent = `Player ${tttPlayer}'s Turn`;
        }
        
        renderTicTacToe();
    }
}

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
        if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[1]] === board[line[2]]) {
            return board[line[0]];
        }
    }
    return null;
}

function renderTicTacToe() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((cell, index) => {
        cell.textContent = tttBoard[index];
        cell.className = 'ttt-cell';
        if (tttBoard[index] === 'X') cell.classList.add('x');
        if (tttBoard[index] === 'O') cell.classList.add('o');
    });
}

// ===========================
// SNAKE GAME
// ===========================
let snakeGameActive = false;
let snakeGame = {
    snake: [{x: 10, y: 10}],
    direction: {x: 1, y: 0},
    food: {x: 15, y: 15},
    score: 0,
    gameLoop: null
};

function initSnake() {
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = {x: 1, y: 0};
    snakeGame.score = 0;
    snakeGameActive = true;
    
    document.getElementById('score-snake').textContent = snakeGame.score;
    
    document.addEventListener('keydown', handleSnakeKeyPress);
    
    snakeGame.gameLoop = setInterval(updateSnake, 100);
}

function stopSnake() {
    snakeGameActive = false;
    clearInterval(snakeGame.gameLoop);
    document.removeEventListener('keydown', handleSnakeKeyPress);
}

function resetSnake() {
    stopSnake();
    initSnake();
}

function handleSnakeKeyPress(e) {
    if (!document.getElementById('game-snake').classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft' && snakeGame.direction.x === 0) snakeGame.direction = {x: -1, y: 0};
    if (e.key === 'ArrowRight' && snakeGame.direction.x === 0) snakeGame.direction = {x: 1, y: 0};
    if (e.key === 'ArrowUp' && snakeGame.direction.y === 0) snakeGame.direction = {x: 0, y: -1};
    if (e.key === 'ArrowDown' && snakeGame.direction.y === 0) snakeGame.direction = {x: 0, y: 1};
}

function updateSnake() {
    const head = snakeGame.snake[0];
    const newHead = {
        x: head.x + snakeGame.direction.x,
        y: head.y + snakeGame.direction.y
    };

    if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20) {
        stopSnake();
        alert(`Game Over! Score: ${snakeGame.score}`);
        return;
    }

    snakeGame.snake.unshift(newHead);

    if (newHead.x === snakeGame.food.x && newHead.y === snakeGame.food.y) {
        snakeGame.score += 10;
        snakeGame.food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
    } else {
        snakeGame.snake.pop();
    }

    if (snakeGame.snake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        stopSnake();
        alert(`Game Over! Score: ${snakeGame.score}`);
        return;
    }

    document.getElementById('score-snake').textContent = snakeGame.score;
    drawSnake();
}

function drawSnake() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff00';
    snakeGame.snake.forEach(seg => {
        ctx.fillRect(seg.x * 20, seg.y * 20, 18, 18);
    });

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(snakeGame.food.x * 20, snakeGame.food.y * 20, 18, 18);
}

// ===========================
// MEMORY MATCH GAME
// ===========================
let memoryGame = {
    cards: [],
    flipped: [],
    matched: [],
    moves: 0
};

const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤'];

function initMemory() {
    memoryGame.cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    memoryGame.flipped = [];
    memoryGame.matched = [];
    memoryGame.moves = 0;
    
    document.getElementById('memory-moves').textContent = memoryGame.moves;
    renderMemory();
}

function resetMemory() {
    initMemory();
}

function flipCard(index) {
    if (memoryGame.flipped.includes(index) || memoryGame.matched.includes(index)) return;
    
    memoryGame.flipped.push(index);
    renderMemory();
    
    if (memoryGame.flipped.length === 2) {
        memoryGame.moves++;
        document.getElementById('memory-moves').textContent = memoryGame.moves;
        
        const [a, b] = memoryGame.flipped;
        if (memoryGame.cards[a] === memoryGame.cards[b]) {
            memoryGame.matched.push(a, b);
            memoryGame.flipped = [];
            
            if (memoryGame.matched.length === memoryGame.cards.length) {
                setTimeout(() => alert(`You Won! Moves: ${memoryGame.moves}`), 300);
            }
        } else {
            setTimeout(() => {
                memoryGame.flipped = [];
                renderMemory();
            }, 600);
        }
    }
}

function renderMemory() {
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    
    memoryGame.cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        
        if (memoryGame.flipped.includes(index) || memoryGame.matched.includes(index)) {
            card.classList.add('flipped');
            card.textContent = emoji;
        }
        
        if (memoryGame.matched.includes(index)) {
            card.classList.add('matched');
        }
        
        card.onclick = () => flipCard(index);
        board.appendChild(card);
    });
}

// ===========================
// FLAPPY BIRD GAME
// ===========================
let flappyGameActive = false;
let flappyGame = {
    player: {y: 250, x: 50, width: 20, height: 20, velocity: 0},
    pipes: [],
    score: 0,
    gameLoop: null,
    pipeGap: 100,
    pipeWidth: 50
};

function initFlappy() {
    flappyGame.player = {y: 250, x: 50, width: 20, height: 20, velocity: 0};
    flappyGame.pipes = [];
    flappyGame.score = 0;
    flappyGameActive = true;
    
    document.getElementById('score-flappy').textContent = flappyGame.score;
    
    document.addEventListener('keydown', handleFlappyInput);
    document.getElementById('flappy-canvas').addEventListener('click', handleFlappyInput);
    
    flappyGame.gameLoop = setInterval(updateFlappy, 30);
}

function stopFlappy() {
    flappyGameActive = false;
    clearInterval(flappyGame.gameLoop);
    document.removeEventListener('keydown', handleFlappyInput);
    document.getElementById('flappy-canvas').removeEventListener('click', handleFlappyInput);
}

function resetFlappy() {
    stopFlappy();
    initFlappy();
}

function handleFlappyInput(e) {
    if (!flappyGameActive) return;
    if (e.key === ' ' || e.type === 'click') {
        e.preventDefault();
        flappyGame.player.velocity = -8;
    }
}

function updateFlappy() {
    flappyGame.player.velocity += 0.4;
    flappyGame.player.y += flappyGame.player.velocity;

    if (flappyGame.player.y + flappyGame.player.height > 600 || flappyGame.player.y < 0) {
        endFlappyGame();
        return;
    }

    if (Math.random() < 0.01) {
        const pipeY = Math.random() * (400 - flappyGame.pipeGap);
        flappyGame.pipes.push({
            x: 400,
            topHeight: pipeY,
            bottomY: pipeY + flappyGame.pipeGap,
            passed: false
        });
    }

    flappyGame.pipes = flappyGame.pipes.filter(pipe => pipe.x > -flappyGame.pipeWidth);
    
    flappyGame.pipes.forEach(pipe => {
        pipe.x -= 5;
        
        if (!pipe.passed && pipe.x < flappyGame.player.x) {
            pipe.passed = true;
            flappyGame.score++;
            document.getElementById('score-flappy').textContent = flappyGame.score;
        }

        if (flappyGame.player.x < pipe.x + flappyGame.pipeWidth &&
            flappyGame.player.x + flappyGame.player.width > pipe.x) {
            if (flappyGame.player.y < pipe.topHeight || 
                flappyGame.player.y + flappyGame.player.height > pipe.bottomY) {
                endFlappyGame();
            }
        }
    });

    drawFlappy();
}

function endFlappyGame() {
    stopFlappy();
    alert(`Game Over! Score: ${flappyGame.score}`);
}

function drawFlappy() {
    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(flappyGame.player.x, flappyGame.player.y, flappyGame.player.width, flappyGame.player.height);

    ctx.fillStyle = '#228b22';
    flappyGame.pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, flappyGame.pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.bottomY, flappyGame.pipeWidth, canvas.height - pipe.bottomY);
    });
}

// ===========================
// QUIZ GAME
// ===========================
let quizGame = {
    questions: [
        {
            question: "What is the capital of France?",
            options: ["London", "Paris", "Berlin", "Madrid"],
            correct: 1
        },
        {
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correct: 1
        },
        {
            question: "What is the largest planet?",
            options: ["Mars", "Saturn", "Jupiter", "Neptune"],
            correct: 2
        },
        {
            question: "What is the smallest prime number?",
            options: ["1", "2", "3", "5"],
            correct: 1
        },
        {
            question: "What is the chemical symbol for Gold?",
            options: ["Go", "Gd", "Au", "Ag"],
            correct: 2
        },
        {
            question: "How many continents are there?",
            options: ["5", "6", "7", "8"],
            correct: 2
        },
        {
            question: "What is the speed of light?",
            options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
            correct: 0
        },
        {
            question: "What is the most spoken language?",
            options: ["Spanish", "English", "Mandarin", "Hindi"],
            correct: 2
        },
        {
            question: "What year did World War II end?",
            options: ["1943", "1944", "1945", "1946"],
            correct: 2
        },
        {
            question: "What is the deepest ocean?",
            options: ["Atlantic", "Indian", "Arctic", "Pacific"],
            correct: 3
        }
    ],
    currentQuestion: 0,
    score: 0,
    answered: false
};

function initQuiz() {
    quizGame.currentQuestion = 0;
    quizGame.score = 0;
    quizGame.answered = false;
    showQuizQuestion();
}

function showQuizQuestion() {
    const q = quizGame.questions[quizGame.currentQuestion];
    document.getElementById('quiz-current').textContent = quizGame.currentQuestion + 1;
    document.getElementById('quiz-total').textContent = quizGame.questions.length;
    document.getElementById('score-quiz').textContent = quizGame.score;
    document.getElementById('quiz-question').textContent = q.question;

    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.onclick = () => selectQuizAnswer(index);
        optionsDiv.appendChild(btn);
    });

    quizGame.answered = false;
}

function selectQuizAnswer(index) {
    if (quizGame.answered) return;
    quizGame.answered = true;

    const q = quizGame.questions[quizGame.currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    if (index === q.correct) {
        options[index].classList.add('correct');
        quizGame.score++;
    } else {
        options[index].classList.add('incorrect');
        options[q.correct].classList.add('correct');
    }

    document.getElementById('score-quiz').textContent = quizGame.score;

    setTimeout(() => {
        quizGame.currentQuestion++;
        if (quizGame.currentQuestion < quizGame.questions.length) {
            showQuizQuestion();
        } else {
            alert(`Quiz Complete! Score: ${quizGame.score}/${quizGame.questions.length}`);
        }
    }, 1000);
}

// ===========================
// COLOR GUESSING GAME
// ===========================
let colorGame = {
    colors: [],
    currentColor: '',
    correct: 0,
    score: 0
};

function initColorGuess() {
    colorGame.score = 0;
    colorGame.correct = 0;
    document.getElementById('score-colorguess').textContent = colorGame.score;
    generateColorRound();
}

function resetColorGuess() {
    initColorGuess();
}

function generateColorRound() {
    const rgb = {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };

    colorGame.currentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('color-display').style.background = colorGame.currentColor;

    const options = [];
    for (let i = 0; i < 3; i++) {
        const newRgb = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
        options.push(`rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`);
    }
    options.push(colorGame.currentColor);
    options.sort(() => Math.random() - 0.5);

    const optionsDiv = document.getElementById('color-options');
    optionsDiv.innerHTML = '';

    options.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'color-option';
        btn.textContent = color;
        btn.onclick = () => checkColorGuess(color, btn);
        optionsDiv.appendChild(btn);
    });

    const rgbText = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('color-text').textContent = rgbText;
}

function checkColorGuess(color, btn) {
    if (color === colorGame.currentColor) {
        btn.classList.add('correct');
        colorGame.score += 10;
        setTimeout(generateColorRound, 800);
    } else {
        btn.classList.add('incorrect');
        document.querySelectorAll('.color-option').forEach(button => {
            if (button.textContent === colorGame.currentColor) {
                button.classList.add('correct');
            }
        });
        setTimeout(() => alert(`Wrong! Score: ${colorGame.score}`), 500);
    }
    document.getElementById('score-colorguess').textContent = colorGame.score;
}

// ===========================
// BRICK BREAKER GAME
// ===========================
let breakoutGameActive = false;
let breakoutGame = {
    paddle: {x: 175, y: 380, width: 50, height: 10},
    ball: {x: 200, y: 350, radius: 5, vx: 4, vy: -4},
    bricks: [],
    score: 0,
    gameLoop: null
};

function initBreakout() {
    breakoutGame.paddle = {x: 175, y: 380, width: 50, height: 10};
    breakoutGame.ball = {x: 200, y: 350, radius: 5, vx: 4, vy: -4};
    breakoutGame.score = 0;
    breakoutGame.bricks = [];
    breakoutGameActive = true;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            breakoutGame.bricks.push({
                x: col * 50,
                y: row * 20,
                width: 48,
                height: 18,
                active: true
            });
        }
    }

    document.getElementById('score-breakout').textContent = breakoutGame.score;
    document.getElementById('breakout-canvas').addEventListener('mousemove', handleBreakoutMouseMove);
    
    breakoutGame.gameLoop = setInterval(updateBreakout, 30);
}

function stopBreakout() {
    breakoutGameActive = false;
    clearInterval(breakoutGame.gameLoop);
    document.getElementById('breakout-canvas').removeEventListener('mousemove', handleBreakoutMouseMove);
}

function resetBreakout() {
    stopBreakout();
    initBreakout();
}

function handleBreakoutMouseMove(e) {
    if (!breakoutGameActive) return;
    const canvas = document.getElementById('breakout-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    breakoutGame.paddle.x = Math.max(0, Math.min(x - breakoutGame.paddle.width / 2, 400 - breakoutGame.paddle.width));
}

function updateBreakout() {
    breakoutGame.ball.x += breakoutGame.ball.vx;
    breakoutGame.ball.y += breakoutGame.ball.vy;

    if (breakoutGame.ball.x - breakoutGame.ball.radius < 0 || 
        breakoutGame.ball.x + breakoutGame.ball.radius > 400) {
        breakoutGame.ball.vx *= -1;
    }

    if (breakoutGame.ball.y - breakoutGame.ball.radius < 0) {
        breakoutGame.ball.vy *= -1;
    }

    if (breakoutGame.ball.y - breakoutGame.ball.radius > 400) {
        stopBreakout();
        alert(`Game Over! Score: ${breakoutGame.score}`);
        return;
    }

    if (breakoutGame.ball.y + breakoutGame.ball.radius > breakoutGame.paddle.y &&
        breakoutGame.ball.x > breakoutGame.paddle.x &&
        breakoutGame.ball.x < breakoutGame.paddle.x + breakoutGame.paddle.width) {
        breakoutGame.ball.vy *= -1;
        breakoutGame.ball.y = breakoutGame.paddle.y - breakoutGame.ball.radius;
    }

    breakoutGame.bricks.forEach(brick => {
        if (!brick.active) return;

        if (breakoutGame.ball.x > brick.x &&
            breakoutGame.ball.x < brick.x + brick.width &&
            breakoutGame.ball.y > brick.y &&
            breakoutGame.ball.y < brick.y + brick.height) {
            brick.active = false;
            breakoutGame.ball.vy *= -1;
            breakoutGame.score += 10;
            document.getElementById('score-breakout').textContent = breakoutGame.score;
        }
    });

    const allBroken = breakoutGame.bricks.every(b => !b.active);
    if (allBroken) {
        stopBreakout();
        alert(`Level Complete! Score: ${breakoutGame.score}`);
        return;
    }

    drawBreakout();
}

function drawBreakout() {
    const canvas = document.getElementById('breakout-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(breakoutGame.paddle.x, breakoutGame.paddle.y, breakoutGame.paddle.width, breakoutGame.paddle.height);

    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(breakoutGame.ball.x, breakoutGame.ball.y, breakoutGame.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    breakoutGame.bricks.forEach(brick => {
        if (brick.active) {
            ctx.fillStyle = '#667eea';
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
}
