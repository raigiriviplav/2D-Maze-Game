const levels = [

    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,2,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],

    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,1,0,0,0,1],
        [1,0,1,1,0,1,0,1,0,1],
        [1,0,0,1,0,0,0,1,0,1],
        [1,1,0,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,2,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],

    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,2,1],
        [1,1,1,1,1,1,1,1,1,1]
    ]

];


let currentLevel = 0;

let player;
let enemy;
let key;
let coins;

let score = 0;
let lives = 3;
let timeLeft = 60;

let hasKey = false;

let gameRunning = false;
let paused = false;

let timerInterval;
let enemyInterval;


/* =========================
   START GAME
========================= */

function startGame() {

    document.getElementById("startScreen").style.display = "none";

    document.getElementById("gameScreen").style.display = "block";

    document.getElementById("endScreen").style.display = "none";

    currentLevel = 0;

    score = 0;

    lives = 3;

    gameRunning = true;

    paused = false;

    loadLevel();

    startTimer();

    startEnemy();

}


/* =========================
   LOAD LEVEL
========================= */

function loadLevel() {

    player = {
        row: 1,
        col: 1
    };


    key = {
        row: 8,
        col: 8
    };


    enemy = {
        row: 5,
        col: 6
    };


    coins = [

        { row: 1, col: 2 },

        { row: 3, col: 5 },

        { row: 7, col: 4 }

    ];


    hasKey = false;

    timeLeft = 60;

    drawMaze();

    updateStats();

}


/* =========================
   DRAW MAZE
========================= */

function drawMaze() {

    const game = document.getElementById("game");

    game.innerHTML = "";

    const maze = levels[currentLevel];


    for (let row = 0; row < maze.length; row++) {

        for (let col = 0; col < maze[row].length; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");


            if (maze[row][col] === 1) {

                cell.classList.add("wall");

            }


            if (
                player.row === row &&
                player.col === col
            ) {

                cell.classList.add("player");

            }


            if (
                !hasKey &&
                key.row === row &&
                key.col === col
            ) {

                cell.classList.add("key");

            }


            if (
                row === 1 &&
                col === 8
            ) {

                cell.classList.add("exit");

            }


            for (let coin of coins) {

                if (
                    coin.row === row &&
                    coin.col === col
                ) {

                    cell.classList.add("coin");

                }

            }


            if (
                enemy.row === row &&
                enemy.col === col
            ) {

                cell.classList.add("enemy");

            }


            game.appendChild(cell);

        }

    }

}


/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer(rowChange, colChange) {

    if (!gameRunning || paused) {

        return;

    }


    const maze = levels[currentLevel];


    const newRow =
        player.row + rowChange;


    const newCol =
        player.col + colChange;


    if (
        newRow < 0 ||
        newRow >= maze.length ||
        newCol < 0 ||
        newCol >= maze[0].length
    ) {

        return;

    }


    if (maze[newRow][newCol] === 1) {

        return;

    }


    player.row = newRow;

    player.col = newCol;

    score++;


    checkCoin();

    checkKey();

    checkEnemyCollision();

    checkExit();


    drawMaze();

    updateStats();

}


/* =========================
   COINS
========================= */

function checkCoin() {

    for (let i = coins.length - 1; i >= 0; i--) {

        if (
            player.row === coins[i].row &&
            player.col === coins[i].col
        ) {

            coins.splice(i, 1);

            score += 10;

            message("🪙 Coin collected! +10");

            playSound(700);

        }

    }

}


/* =========================
   KEY
========================= */

function checkKey() {

    if (
        !hasKey &&
        player.row === key.row &&
        player.col === key.col
    ) {

        hasKey = true;

        score += 20;

        message("🔑 Key collected! Find the exit!");

        playSound(900);

    }

}


/* =========================
   EXIT
========================= */

function checkExit() {

    if (
        player.row === 1 &&
        player.col === 8
    ) {

        if (!hasKey) {

            message("🔑 You need the key first!");

            return;

        }


        score += timeLeft * 2;


        if (currentLevel < levels.length - 1) {

            currentLevel++;

            message("🎉 Level Complete!");

            setTimeout(() => {

                loadLevel();

            }, 700);

        }

        else {

            winGame();

        }

    }

}


/* =========================
   ENEMY MOVEMENT
========================= */

function startEnemy() {

    clearInterval(enemyInterval);


    enemyInterval = setInterval(() => {

        if (!gameRunning || paused) {

            return;

        }


        moveEnemy();

        checkEnemyCollision();

        drawMaze();

    }, 700);

}


/* =========================
   MOVE ENEMY
========================= */

function moveEnemy() {

    const directions = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    const direction =
        directions[
            Math.floor(Math.random() * directions.length)
        ];


    const newRow =
        enemy.row + direction[0];


    const newCol =
        enemy.col + direction[1];


    const maze = levels[currentLevel];


    if (
        newRow >= 0 &&
        newRow < maze.length &&
        newCol >= 0 &&
        newCol < maze[0].length &&
        maze[newRow][newCol] !== 1
    ) {

        enemy.row = newRow;

        enemy.col = newCol;

    }

}


/* =========================
   ENEMY COLLISION
========================= */

function checkEnemyCollision() {

    if (
        player.row === enemy.row &&
        player.col === enemy.col
    ) {

        lives--;

        playSound(200);


        if (lives <= 0) {

            gameOver();

            return;

        }


        player.row = 1;

        player.col = 1;


        message("👾 Enemy hit you! -1 life");

        updateStats();

    }

}


/* =========================
   TIMER
========================= */

function startTimer() {

    clearInterval(timerInterval);


    timerInterval = setInterval(() => {

        if (!gameRunning || paused) {

            return;

        }


        timeLeft--;

        updateStats();


        if (timeLeft <= 0) {

            gameOver();

        }

    }, 1000);

}


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (!gameRunning) {

        return;

    }


    paused = !paused;


    if (paused) {

        message("⏸️ Game Paused");

    }

    else {

        message("▶️ Game Resumed");

    }

}


/* =========================
   RESTART
========================= */

function restartGame() {

    clearInterval(timerInterval);

    clearInterval(enemyInterval);

    document.getElementById("endScreen").style.display = "none";

    document.getElementById("startScreen").style.display = "none";

    document.getElementById("gameScreen").style.display = "block";

    currentLevel = 0;

    score = 0;

    lives = 3;

    gameRunning = true;

    paused = false;

    loadLevel();

    startTimer();

    startEnemy();

}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    gameRunning = false;

    clearInterval(timerInterval);

    clearInterval(enemyInterval);


    saveHighScore();


    document.getElementById("gameScreen").style.display = "none";

    document.getElementById("endScreen").style.display = "flex";

    document.getElementById("endTitle").textContent =
        "💀 GAME OVER";


    document.getElementById("finalScore").textContent =
        "Your Score: " + score;

}


/* =========================
   WIN
========================= */

function winGame() {

    gameRunning = false;

    clearInterval(timerInterval);

    clearInterval(enemyInterval);


    score += 100;


    saveHighScore();


    document.getElementById("gameScreen").style.display = "none";

    document.getElementById("endScreen").style.display = "flex";


    document.getElementById("endTitle").textContent =
        "🏆 YOU WON!";


    document.getElementById("finalScore").textContent =
        "Final Score: " + score;

}


/* =========================
   HIGH SCORE
========================= */

function saveHighScore() {

    const oldScore =
        Number(localStorage.getItem("mazeHighScore")) || 0;


    if (score > oldScore) {

        localStorage.setItem(
            "mazeHighScore",
            score
        );

    }


    updateHighScore();

}


function updateHighScore() {

    const highScore =
        Number(localStorage.getItem("mazeHighScore")) || 0;


    document.getElementById("highScore").textContent =
        highScore;

}


/* =========================
   MESSAGE
========================= */

function message(text) {

    document.getElementById("message").textContent =
        text;

}


/* =========================
   STATS
========================= */

function updateStats() {

    document.getElementById("score").textContent =
        score;

    document.getElementById("lives").textContent =
        lives;

    document.getElementById("timer").textContent =
        timeLeft;

    document.getElementById("level").textContent =
        currentLevel + 1;

    updateHighScore();

}


/* =========================
   SOUND
========================= */

function playSound(frequency) {

    try {

        const audio =
            new AudioContext();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();


        oscillator.frequency.value =
            frequency;


        oscillator.connect(gain);

        gain.connect(audio.destination);


        oscillator.start();


        gain.gain.exponentialRampToValueAtTime(

            0.001,

            audio.currentTime + 0.15

        );


        oscillator.stop(
            audio.currentTime + 0.15
        );

    }

    catch (error) {

        console.log("Sound unavailable");

    }

}


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        const keyPressed =
            event.key.toLowerCase();


        if (
            keyPressed === "arrowup" ||
            keyPressed === "w"
        ) {

            movePlayer(-1, 0);

        }


        else if (
            keyPressed === "arrowdown" ||
            keyPressed === "s"
        ) {

            movePlayer(1, 0);

        }


        else if (
            keyPressed === "arrowleft" ||
            keyPressed === "a"
        ) {

            movePlayer(0, -1);

        }


        else if (
            keyPressed === "arrowright" ||
            keyPressed === "d"
        ) {

            movePlayer(0, 1);

        }


        else if (keyPressed === "p") {

            togglePause();

        }

    }
);


/* =========================
   INITIAL SETUP
========================= */

updateHighScore();