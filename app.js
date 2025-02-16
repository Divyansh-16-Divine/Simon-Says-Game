const tiles = document.querySelectorAll(".tile");
const startButton = document.getElementById("start-button");

// Create and insert highest score display dynamically
const highestScoreDisplay = document.createElement("p");
highestScoreDisplay.id = "highest-score";
highestScoreDisplay.textContent = "Highest Score: 0";
document.body.insertBefore(highestScoreDisplay, startButton);

let sequence = [];
let playerSequence = [];
let level = 0;
let highestScore = localStorage.getItem("highestScore") || 0;

highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;

function getRandomColor() {
    const colors = ["red", "blue", "green", "yellow"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function flashTile(color) {
    const tile = document.querySelector(`.tile.${color}`);
    tile.classList.add("active");
    setTimeout(() => tile.classList.remove("active"), 500);
}

function playSequence() {
    let delay = 1000;
    playerSequence = [];
    sequence.forEach((color, index) => {
        setTimeout(() => flashTile(color), delay * index);
    });
}

function nextRound() {
    level++;
    sequence.push(getRandomColor());
    setTimeout(playSequence, 1000);
}

function checkAnswer(index) {
    if (playerSequence[index] !== sequence[index]) {
        if (level > highestScore) {
            highestScore = level;
            localStorage.setItem("highestScore", highestScore);
            highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;
        }
        alert(`Game Over! You reached level ${level}. Highest Score: ${highestScore}`);
        sequence = [];
        level = 0;
        return;
    }
    if (playerSequence.length === sequence.length) {
        setTimeout(nextRound, 1000);
    }
}

tiles.forEach(tile => {
    tile.addEventListener("click", () => {
        const color = tile.dataset.color;
        playerSequence.push(color);
        flashTile(color);
        checkAnswer(playerSequence.length - 1);
    });
});

startButton.addEventListener("click", () => {
    sequence = [];
    level = 0;
    nextRound();
});