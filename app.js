const tiles = document.querySelectorAll(".tile");
const startButton = document.getElementById("start-button");
const levelDisplay = document.getElementById("level-display");
const highestScoreDisplay = document.getElementById("highest-score");

let sequence = [];
let playerSequence = [];
let level = 0;
let highestScore = localStorage.getItem("highestScore") || 0;
let isPlaying = false;
let isPlayerTurn = false;

// Initialize display
highestScoreDisplay.textContent = highestScore;
levelDisplay.textContent = level;

// Sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration = 200) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Sound frequencies for each color
const sounds = {
  red: 329.63, // E4
  blue: 261.63, // C4
  green: 392.0, // G4
  yellow: 440.0, // A4
};

function getRandomColor() {
  const colors = ["red", "blue", "green", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function flashTile(color) {
  const tile = document.querySelector(`.tile.${color}`);
  tile.classList.add("active");
  playSound(sounds[color]);

  setTimeout(() => {
    tile.classList.remove("active");
  }, 500);
}

function playSequence() {
  isPlayerTurn = false;
  playerSequence = [];
  let delay = 0;

  // Update start button text
  startButton.innerHTML = "<span>WATCH...</span>";
  startButton.disabled = true;

  sequence.forEach((color, index) => {
    setTimeout(() => {
      flashTile(color);

      // If this is the last color in sequence, enable player turn
      if (index === sequence.length - 1) {
        setTimeout(() => {
          isPlayerTurn = true;
          startButton.innerHTML = "<span>YOUR TURN</span>";
        }, 600);
      }
    }, delay);
    delay += 800;
  });
}

function nextRound() {
  level++;
  levelDisplay.textContent = level;
  levelDisplay.classList.add("pulse");

  setTimeout(() => {
    levelDisplay.classList.remove("pulse");
  }, 500);

  sequence.push(getRandomColor());
  setTimeout(playSequence, 1000);
}

function checkAnswer(index) {
  if (playerSequence[index] !== sequence[index]) {
    gameOver();
    return;
  }

  if (playerSequence.length === sequence.length) {
    isPlayerTurn = false;
    startButton.innerHTML = "<span>NICE!</span>";

    // Check for new high score
    if (level > highestScore) {
      highestScore = level;
      localStorage.setItem("highestScore", highestScore);
      highestScoreDisplay.textContent = highestScore;
      highestScoreDisplay.classList.add("pulse");

      setTimeout(() => {
        highestScoreDisplay.classList.remove("pulse");
      }, 500);
    }

    setTimeout(nextRound, 1200);
  }
}

function gameOver() {
  isPlaying = false;
  isPlayerTurn = false;

  // Play error sound
  playSound(150, 400);

  // Flash all tiles red briefly
  tiles.forEach((tile) => {
    tile.style.background = "linear-gradient(135deg, #ff4757 0%, #ff3838 100%)";
    tile.style.transform = "scale(0.95)";
  });

  setTimeout(() => {
    // Reset tile colors
    tiles.forEach((tile) => {
      tile.style.background = "";
      tile.style.transform = "";
    });

    // Show game over message
    const message =
      level > highestScore
        ? `🎉 NEW RECORD! Level ${level}`
        : `Game Over! Level ${level}`;

    startButton.innerHTML = `<span>${message}</span>`;

    setTimeout(() => {
      startButton.innerHTML = "<span>START GAME</span>";
      startButton.disabled = false;
    }, 2000);
  }, 500);

  // Reset game state
  sequence = [];
  playerSequence = [];
  level = 0;
  levelDisplay.textContent = level;
}

// Add click event listeners to tiles
tiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    if (!isPlayerTurn || !isPlaying) return;

    const color = tile.dataset.color;
    playerSequence.push(color);
    flashTile(color);
    checkAnswer(playerSequence.length - 1);
  });

  // Add hover effect sound
  tile.addEventListener("mouseenter", () => {
    if (isPlayerTurn && isPlaying) {
      // Very quiet preview sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = sounds[tile.dataset.color];
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  });
});

// Start button event listener
startButton.addEventListener("click", () => {
  if (isPlaying) return;

  // Resume audio context if needed (for mobile browsers)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  isPlaying = true;
  sequence = [];
  playerSequence = [];
  level = 0;
  levelDisplay.textContent = level;

  startButton.innerHTML = "<span>STARTING...</span>";
  startButton.disabled = true;

  setTimeout(() => {
    nextRound();
  }, 500);
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (!isPlayerTurn || !isPlaying) return;

  const keyMap = {
    1: "red",
    2: "blue",
    3: "green",
    4: "yellow",
  };

  const color = keyMap[e.key];
  if (color) {
    playerSequence.push(color);
    flashTile(color);
    checkAnswer(playerSequence.length - 1);
  }
});

// Prevent context menu on tiles for better mobile experience
tiles.forEach((tile) => {
  tile.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
});
