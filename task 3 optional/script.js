// Winning board combinations for Tic Tac Toe.
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Current game state and score/history storage.
const state = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  active: true,
  mode: 'two',
  difficulty: 'easy',
  score: { X: 0, O: 0, Draw: 0 },
  history: [],
};

const cache = {
  cells: [...document.querySelectorAll('.cell')],
  statusText: document.getElementById('statusText'),
  board: document.getElementById('board'),
  newGameBtn: document.getElementById('newGameBtn'),
  resetScoreBtn: document.getElementById('resetScoreBtn'),
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  difficultySet: document.getElementById('difficultySet'),
  themeToggle: document.getElementById('themeToggle'),
  confettiLayer: document.getElementById('confettiLayer'),
};

function init() {
  setupEvents();
  restoreTheme();
  updateUI();
}

function setupEvents() {
  cache.cells.forEach((cell) => cell.addEventListener('click', onCellClick));
  cache.newGameBtn.addEventListener('click', resetBoard);
  cache.resetScoreBtn.addEventListener('click', resetScoreboard);
  cache.clearHistoryBtn.addEventListener('click', clearHistory);
  document.querySelectorAll('input[name="mode"]').forEach((input) => {
    input.addEventListener('change', onModeChange);
  });
  document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
    input.addEventListener('change', onDifficultyChange);
  });
  cache.themeToggle.addEventListener('click', toggleTheme);
}

function onCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);
  if (!state.active || state.board[index]) return;

  playMove(index);
}

function playMove(index) {
  state.board[index] = state.currentPlayer;
  const cell = cache.cells[index];
  cell.textContent = state.currentPlayer;
  cell.classList.add('filled', state.currentPlayer.toLowerCase());
  animatePlacement(cell);
  soundEffect('move');

  const result = evaluateBoard();
  if (result) {
    finalizeRound(result);
    return;
  }

  state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
  updateUI();

  if (state.mode === 'single' && state.active && state.currentPlayer === 'O') {
    window.setTimeout(runAiTurn, 320);
  }
}

function evaluateBoard() {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const first = state.board[a];
    if (first && first === state.board[b] && first === state.board[c]) {
      return { winner: first, line };
    }
  }

  if (state.board.every(Boolean)) {
    return { winner: null };
  }

  return null;
}

function finalizeRound(result) {
  state.active = false;
  if (result.winner) {
    highlightWinningLine(result.line);
    state.score[result.winner] += 1;
    cache.statusText.textContent = `${result.winner} wins!`;
    createHistoryEntry(`${result.winner} won`);
    soundEffect('win');
    launchConfetti();
  } else {
    state.score.Draw += 1;
    cache.statusText.textContent = `Draw — no winners`;
    createHistoryEntry('Draw');
    soundEffect('draw');
  }
  updateScoreboard();
}

function highlightWinningLine(line) {
  line.forEach((index) => cache.cells[index].classList.add('win'));
}

function animatePlacement(cell) {
  cell.animate([
    { transform: 'scale(0.7)', opacity: 0.2 },
    { transform: 'scale(1.02)', opacity: 1 }
  ], { duration: 220, easing: 'ease-out' });
}

function updateUI() {
  cache.cells.forEach((cell, index) => {
    if (!state.board[index]) {
      cell.textContent = '';
      cell.classList.remove('filled', 'x', 'o', 'win');
    }
  });

  cache.statusText.textContent = state.active
    ? `Turn: ${state.currentPlayer}`
    : cache.statusText.textContent;

  cache.difficultySet.style.display = state.mode === 'single' ? 'grid' : 'none';
  updateScoreboard();
  updateHistoryList();
}

function resetBoard() {
  state.board = Array(9).fill(null);
  state.currentPlayer = 'X';
  state.active = true;
  cache.cells.forEach((cell) => cell.classList.remove('win'));
  cache.statusText.textContent = `${state.currentPlayer} starts the game`;
  updateUI();
}

function resetScoreboard() {
  state.score = { X: 0, O: 0, Draw: 0 };
  updateScoreboard();
}

function onModeChange(event) {
  state.mode = event.target.value;
  if (state.mode === 'single') {
    state.difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  }
  resetBoard();
}

function onDifficultyChange(event) {
  state.difficulty = event.target.value;
  resetBoard();
}

function runAiTurn() {
  if (!state.active) return;
  const move = chooseAiMove();
  if (move !== null) playMove(move);
}

function chooseAiMove() {
  const available = state.board
    .map((value, index) => (value ? null : index))
    .filter(Number.isFinite);

  if (!available.length) return null;

  if (state.difficulty === 'easy') {
    return randomChoice(available);
  }

  if (state.difficulty === 'medium') {
    const forced = findWinningMove('O') ?? findWinningMove('X');
    if (forced !== null) return forced;
    if (state.board[4] === null) return 4;
    return randomChoice(available);
  }

  return minimaxDecision();
}

function findWinningMove(player) {
  for (const index of state.board.keys()) {
    if (!state.board[index]) {
      state.board[index] = player;
      const outcome = evaluateBoard();
      state.board[index] = null;
      if (outcome?.winner === player) return index;
    }
  }
  return null;
}

function minimaxDecision() {
  const player = 'O';
  const best = minimax(state.board.slice(), player, player);
  return best.index;
}

function minimax(board, player, maximizingPlayer) {
  const outcome = evaluateBoardForBoard(board);
  if (outcome) {
    return { score: outcome.score };
  }

  const available = board
    .map((value, index) => (value ? null : index))
    .filter(Number.isFinite);

  const moves = [];
  for (const index of available) {
    const copy = board.slice();
    copy[index] = player;
    const next = minimax(copy, player === 'O' ? 'X' : 'O', maximizingPlayer);
    moves.push({ index, score: next.score });
  }

  if (player === maximizingPlayer) {
    return moves.reduce((best, current) => (current.score > best.score ? current : best));
  }
  return moves.reduce((best, current) => (current.score < best.score ? current : best));
}

function evaluateBoardForBoard(board) {
  for (const [a, b, c] of WINNING_LINES) {
    const first = board[a];
    if (first && first === board[b] && first === board[c]) {
      return { winner: first, score: first === 'O' ? 10 : -10 };
    }
  }
  if (board.every(Boolean)) {
    return { winner: null, score: 0 };
  }
  return null;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function updateScoreboard() {
  document.getElementById('scoreX').textContent = state.score.X;
  document.getElementById('scoreO').textContent = state.score.O;
  document.getElementById('scoreDraw').textContent = state.score.Draw;
}

function createHistoryEntry(resultText) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.history.unshift(`${timestamp} — ${resultText}`);
  if (state.history.length > 6) state.history.pop();
  updateHistoryList();
}

function updateHistoryList() {
  cache.historyList.innerHTML = state.history
    .map((entry) => `<li><span>${entry.split(' — ')[0]}</span>${entry.split(' — ')[1]}</li>`)
    .join('');
}

function clearHistory() {
  state.history = [];
  updateHistoryList();
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  cache.themeToggle.querySelector('.icon').textContent = next === 'dark' ? '🌙' : '☀️';
  cache.themeToggle.querySelector('.label').textContent = next === 'dark' ? 'Dark' : 'Light';
  localStorage.setItem('ticTacToeTheme', next);
}

function restoreTheme() {
  const stored = localStorage.getItem('ticTacToeTheme') || 'light';
  document.documentElement.dataset.theme = stored;
  cache.themeToggle.querySelector('.icon').textContent = stored === 'dark' ? '🌙' : '☀️';
  cache.themeToggle.querySelector('.label').textContent = stored === 'dark' ? 'Dark' : 'Light';
}

function launchConfetti() {
  const colors = ['#7c3aed', '#ec4899', '#22c55e', '#38bdf8', '#f59e0b'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('span');
    particle.className = 'confetti';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = `${Math.random() * 10 + 6}px`;
    particle.style.height = `${Math.random() * 18 + 6}px`;
    particle.style.animationDuration = `${Math.random() * 1.2 + 0.8}s`;
    cache.confettiLayer.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}

function soundEffect(type) {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  gain.gain.value = 0.08;

  if (type === 'move') {
    oscillator.frequency.value = 520;
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
  } else if (type === 'win') {
    oscillator.frequency.value = 360;
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
  } else if (type === 'draw') {
    oscillator.frequency.value = 280;
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
  }

  oscillator.type = 'sine';
  oscillator.start();
  oscillator.stop(context.currentTime + 0.1);
}

init();
