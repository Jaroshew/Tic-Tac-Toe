let board = Array(9).fill(null); // Game board array
let currentPlayer = "X"; // Current turn: "X" or "O"
let gameMode = "pvp"; // Game mode: "pvp" or "pve"
let playerXName = ""; // Name for player X
let playerOName = ""; // Name for player O
let scores = { X: 0, O: 0 }; // Wins count for each player
let movesCount = { X: 0, O: 0 }; // Move count for each player
let winningCells = []; // Track winning cells for animation

// Functions for Start Page (index.html)
// Toggle the second player's input field based on game mode selection
function toggleSecondPlayerInput() {
  const gameModeSelect = document.getElementById("gameMode");
  if (!gameModeSelect) return;

  const secondPlayerInput = document.getElementById("player-o");
  const secondPlayerLabel = document.querySelector('label[for="player-o"]');

  if (gameModeSelect.value === "pve") {
    secondPlayerInput.value = "Bot";
    secondPlayerInput.disabled = true;
    secondPlayerLabel.textContent = "Bot (O)";

    // Add subtle animation to indicate bot selection
    secondPlayerInput.classList.add("bot-selected");
    setTimeout(() => secondPlayerInput.classList.remove("bot-selected"), 500);
  } else {
    secondPlayerInput.value = "";
    secondPlayerInput.disabled = false;
    secondPlayerLabel.textContent = "Second player (O)";
  }
}

// Form validation for player names
function validateForm() {
  const playerXInput = document.getElementById("player-x");
  const playerOInput = document.getElementById("player-o");

  if (!playerXInput.value.trim()) {
    showFormError("Please enter a name for Player X");
    playerXInput.focus();
    return false;
  }

  if (gameMode === "pvp" && !playerOInput.value.trim()) {
    showFormError("Please enter a name for Player O");
    playerOInput.focus();
    return false;
  }

  return true;
}

// Show form validation error
function showFormError(message) {
  // Check if error message element exists, if not create it
  let errorElement = document.getElementById("form-error");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "form-error";
    errorElement.className = "error-message";

    const startBtn = document.getElementById("startBtn");
    startBtn.parentNode.insertBefore(errorElement, startBtn);
  }

  // Show error message with animation
  errorElement.textContent = message;
  errorElement.style.opacity = "0";
  errorElement.style.display = "block";

  setTimeout(() => {
    errorElement.style.opacity = "1";
  }, 10);

  // Clear error after 3 seconds
  setTimeout(() => {
    errorElement.style.opacity = "0";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 300);
  }, 3000);
}

// Start the game by saving configuration in localStorage and redirecting to game.html
function startGame() {
  // Validate form before starting
  if (!validateForm()) return;

  // Retrieve game mode and player names from input fields
  const selectedMode = document.getElementById("gameMode").value;
  const pX = document.getElementById("player-x").value.trim() || "Player X";
  const pO = document.getElementById("player-o").value.trim() || "Player O";

  // Add transition effect before navigating
  document.getElementById("start-section").classList.add("hidden");

  // Save settings to localStorage
  localStorage.setItem("gameMode", selectedMode);
  localStorage.setItem("playerXName", pX);
  localStorage.setItem("playerOName", pO);

  // Initialize scores and moves
  scores = { X: 0, O: 0 };
  movesCount = { X: 0, O: 0 };
  localStorage.setItem("scores", JSON.stringify(scores));
  localStorage.setItem("movesCount", JSON.stringify(movesCount));

  // Reset game board and current player
  board = Array(9).fill(null);
  currentPlayer = "X";
  winningCells = [];
  localStorage.setItem("board", JSON.stringify(board));
  localStorage.setItem("currentPlayer", currentPlayer);
  localStorage.setItem("winningCells", JSON.stringify(winningCells));

  // Redirect to game page after transition
  setTimeout(() => {
    window.location.href = "game.html";
  }, 400);
}

// Functions for Game Page (game.html)
// Initialize the game page by loading game settings and state from localStorage
function initGame() {
  // Retrieve settings from localStorage
  gameMode = localStorage.getItem("gameMode") || "pvp";
  playerXName = localStorage.getItem("playerXName") || "Player X";
  playerOName = localStorage.getItem("playerOName") || "Player O";
  board = JSON.parse(localStorage.getItem("board")) || Array(9).fill(null);
  currentPlayer = localStorage.getItem("currentPlayer") || "X";
  scores = JSON.parse(localStorage.getItem("scores")) || { X: 0, O: 0 };
  movesCount = JSON.parse(localStorage.getItem("movesCount")) || { X: 0, O: 0 };
  winningCells = JSON.parse(localStorage.getItem("winningCells")) || [];

  // Add entrance animation
  const gameSection = document.getElementById("game-section");
  if (gameSection) {
    gameSection.classList.add("hidden");
    setTimeout(() => {
      gameSection.classList.remove("hidden");
    }, 50);
  }

  renderGameBoard();
  updateTurnIndicator();

  // Add listener to reset button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetGame);
  }

  // If game mode is PvE and it's Bot's turn, make a move
  if (gameMode === "pve" && currentPlayer === "O") {
    setTimeout(botMove, 800);
  }
}

// Render the game board using div elements
function renderGameBoard() {
  const boardElement = document.getElementById("gameBoard");
  if (!boardElement) return;

  boardElement.innerHTML = "";
  board.forEach((cell, index) => {
    const cellElement = document.createElement("div");
    cellElement.classList.add("cell");

    // Add visual classes based on cell state
    if (cell === "X") {
      cellElement.classList.add("occupied-x");
      cellElement.classList.add("taken");
    } else if (cell === "O") {
      cellElement.classList.add("occupied-o");
      cellElement.classList.add("taken");
    }

    // Add animation for winning cells
    if (winningCells.includes(index)) {
      cellElement.classList.add("winner");
    }

    cellElement.innerText = cell || "";

    // Add hover effect class if cell is empty
    if (!cell) {
      cellElement.classList.add("cell-hover");
      cellElement.addEventListener("click", function () {
        handleMove(index);
      });
    }

    boardElement.appendChild(cellElement);
  });
}

// Update the turn indicator text with enhanced styling
function updateTurnIndicator() {
  const turnIndicator = document.getElementById("turnIndicator");
  if (turnIndicator) {
    const name = currentPlayer === "X" ? playerXName : playerOName;
    turnIndicator.innerText = `${name}'s turn (${currentPlayer})`;

    // Update indicator color based on current player
    turnIndicator.className = ""; // Clear previous classes
    turnIndicator.classList.add(
      currentPlayer === "X" ? "player-x-turn" : "player-o-turn"
    );
  }
}

// Handle a move on a given board cell index
// Handle a move on a given board cell index
function handleMove(index) {
  // Ignore move if cell is occupied or game is already won
  if (board[index] || checkWin()) return;

  // Mark the cell and update move count
  board[index] = currentPlayer;
  movesCount[currentPlayer]++;

  const cellElement = document.querySelectorAll(".cell")[index];
  if (cellElement) {
    cellElement.classList.add("cell-animation");
    cellElement.classList.add(
      currentPlayer === "X" ? "occupied-x" : "occupied-o"
    );
    cellElement.classList.add("taken");
    cellElement.innerText = currentPlayer;
  }

  saveState();

  // Check for a win after the move
  const winResult = checkWin();
  if (winResult) {
    winningCells = winResult;
    localStorage.setItem("winningCells", JSON.stringify(winningCells));

    // Highlight winning cells
    winningCells.forEach((cellIndex) => {
      const winCell = document.querySelectorAll(".cell")[cellIndex];
      if (winCell) {
        winCell.classList.add("winner");
      }
    });

    scores[currentPlayer]++;
    saveState();

    // Save the result and redirect to result page after a short delay
    localStorage.setItem(
      "lastResult",
      JSON.stringify({ winner: currentPlayer, winningCells: winningCells })
    );

    setTimeout(() => {
      window.location.href = "result.html";
    }, 1200); // Longer delay for victory animation

    return;
  }

  // Check for a tie
  if (board.every((cell) => cell !== null)) {
    localStorage.setItem("lastResult", JSON.stringify({ winner: null }));
    setTimeout(() => {
      window.location.href = "result.html";
    }, 800);
    return;
  }

  // Switch turns
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  localStorage.setItem("currentPlayer", currentPlayer);
  updateTurnIndicator();

  // If game mode is PvE and it's Bot's turn
  if (gameMode === "pve" && currentPlayer === "O") {
    setTimeout(botMove, 0);
  }
}

// Enhanced bot move with simple strategy
function botMove() {
  if (checkWin() || board.every((cell) => cell !== null)) return;

  let moveIndex;

  // First priority: Win if possible
  moveIndex = findWinningMove("O");
  if (moveIndex !== -1) {
    handleMove(moveIndex);
    return;
  }

  // Second priority: Block opponent's winning move
  moveIndex = findWinningMove("X");
  if (moveIndex !== -1) {
    handleMove(moveIndex);
    return;
  }

  // Third priority: Take center if available
  if (board[4] === null) {
    handleMove(4);
    return;
  }

  // Fourth priority: Take corners if available
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    handleMove(corners[Math.floor(Math.random() * corners.length)]);
    return;
  }

  // Last priority: Take any available cell
  const available = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((i) => i !== null);

  if (available.length > 0) {
    handleMove(available[Math.floor(Math.random() * available.length)]);
  }
}

// Find a winning move for the given player
function findWinningMove(player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    // Check if two cells are filled by the player and the third is empty
    if (board[a] === player && board[b] === player && board[c] === null) {
      return c;
    }
    if (board[a] === player && board[c] === player && board[b] === null) {
      return b;
    }
    if (board[b] === player && board[c] === player && board[a] === null) {
      return a;
    }
  }

  return -1; // No winning move found
}

// Check if there is a winning combination on the board
function checkWin() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return pattern; // Return the winning cells
    }
  }

  return null; // No win
}

// Save the current game state to localStorage
function saveState() {
  localStorage.setItem("board", JSON.stringify(board));
  localStorage.setItem("currentPlayer", currentPlayer);
  localStorage.setItem("scores", JSON.stringify(scores));
  localStorage.setItem("movesCount", JSON.stringify(movesCount));
  localStorage.setItem("winningCells", JSON.stringify(winningCells));
}

// Reset the game board (without clearing overall scores)
function resetGame() {
  // Add button press animation
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.classList.add("button-press");
    setTimeout(() => resetBtn.classList.remove("button-press"), 200);
  }

  board = Array(9).fill(null);
  currentPlayer = "X";
  winningCells = [];
  saveState();

  // Fade out and back in to show reset
  const gameBoard = document.getElementById("gameBoard");
  if (gameBoard) {
    gameBoard.style.opacity = "0";
    setTimeout(() => {
      renderGameBoard();
      gameBoard.style.opacity = "1";
    }, 300);
  } else {
    renderGameBoard();
  }

  updateTurnIndicator();

  // If game mode is PvE and it's Bot's turn, make a move
  if (gameMode === "pve" && currentPlayer === "O") {
    setTimeout(botMove, 800);
  }
}

// Functions for Result Page (result.html)
// Display the game result and scores
function showResult() {
  // Retrieve the last game result from localStorage
  const resultData = JSON.parse(localStorage.getItem("lastResult"));
  if (!resultData) return;

  // Retrieve player names and scores
  playerXName = localStorage.getItem("playerXName") || "Player X";
  playerOName = localStorage.getItem("playerOName") || "Player O";
  scores = JSON.parse(localStorage.getItem("scores")) || { X: 0, O: 0 };
  movesCount = JSON.parse(localStorage.getItem("movesCount")) || { X: 0, O: 0 };

  // Add entrance animation
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    resultSection.classList.add("hidden");
    setTimeout(() => {
      resultSection.classList.remove("hidden");
    }, 50);
  }

  const resultText = document.getElementById("resultText");
  if (resultText) {
    if (resultData.winner) {
      const winnerName = resultData.winner === "X" ? playerXName : playerOName;
      resultText.innerText = `${winnerName} (${resultData.winner}) wins! 🎉`;
      resultText.classList.add(
        resultData.winner === "X" ? "winner-x" : "winner-o"
      );
    } else {
      resultText.innerText = "It's a tie! 🤝";
      resultText.classList.add("tie-result");
    }
  }

  // Display the scores and move counts for each player
  const scoreX = document.getElementById("scoreX");
  const scoreO = document.getElementById("scoreO");

  if (scoreX) {
    scoreX.innerHTML = `
      <div class="player-name">${playerXName} (X)</div>
      <div class="score-value">${scores.X} wins</div>
      <div class="moves-count">Avg moves: ${
        scores.X > 0 ? Math.round(movesCount.X / scores.X) : 0
      }</div>
    `;
    scoreX.classList.add("player-x-score");
  }

  if (scoreO) {
    scoreO.innerHTML = `
      <div class="player-name">${playerOName} (O)</div>
      <div class="score-value">${scores.O} wins</div>
      <div class="moves-count">Avg moves: ${
        scores.O > 0 ? Math.round(movesCount.O / scores.O) : 0
      }</div>
    `;
    scoreO.classList.add("player-o-score");
  }

  // Set up "Play Again" button to restart the board while keeping scores
  const playAgainBtn = document.getElementById("playAgainBtn");
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", function () {
      playAgainBtn.classList.add("button-press");

      setTimeout(() => {
        board = Array(9).fill(null);
        currentPlayer = "X";
        winningCells = [];
        saveState();
        window.location.href = "game.html";
      }, 200);
    });
  }

  // Set up full reset button to clear all game data and return to start page
  const fullResetBtn = document.getElementById("fullResetBtn");
  if (fullResetBtn) {
    fullResetBtn.addEventListener("click", function () {
      fullResetBtn.classList.add("button-press");

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "index.html";
      }, 200);
    });
  }
}

// Helper function to add visual feedback to button presses
function addButtonEffects() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("mousedown", function () {
      this.classList.add("button-press");
    });

    button.addEventListener("mouseup", function () {
      this.classList.remove("button-press");
    });

    button.addEventListener("mouseleave", function () {
      this.classList.remove("button-press");
    });
  });
}

// Add button effects when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  addButtonEffects();
});