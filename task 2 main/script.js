const state = {
  running: false,
  elapsed: 0,
  startTimestamp: null,
  laps: [],
  theme: 'dark',
  animationFrameId: null,
};

const storageKey = 'chronoCraftState';
const timerDisplay = document.getElementById('timerDisplay');
const statusText = document.getElementById('statusText');
const startPauseBtn = document.getElementById('startPauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapList = document.getElementById('lapList');
const lapCount = document.getElementById('lapCount');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playClickTone() {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 520;
  gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.12);
}

function saveState() {
  const storedState = {
    running: state.running,
    elapsed: state.elapsed,
    startTimestamp: state.running && state.startTimestamp
      ? Date.now() - (performance.now() - state.startTimestamp)
      : null,
    laps: state.laps,
    theme: state.theme,
    savedAt: Date.now(),
  };
  localStorage.setItem(storageKey, JSON.stringify(storedState));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.theme = parsed.theme || 'dark';
    state.laps = Array.isArray(parsed.laps) ? parsed.laps : [];
    if (parsed.running) {
      const timeSinceSave = Date.now() - (parsed.startTimestamp || Date.now());
      state.elapsed = (parsed.elapsed || 0) + Math.max(0, timeSinceSave);
      state.running = true;
      state.startTimestamp = performance.now();
    } else {
      state.elapsed = parsed.elapsed || 0;
      state.running = false;
      state.startTimestamp = null;
    }
  } catch (error) {
    console.warn('Failed to parse saved state', error);
  }
}

function formatTime(milliseconds) {
  const total = Math.max(0, milliseconds);
  const ms = Math.floor(total % 1000);
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60000) % 60;
  const hours = Math.floor(total / 3600000);
  const padded = (value, length = 2) => String(value).padStart(length, '0');
  return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}:${String(ms).padStart(3, '0')}`;
}

function updateDisplay(elapsed) {
  timerDisplay.textContent = formatTime(elapsed);
}

function getCurrentElapsed() {
  if (!state.running || !state.startTimestamp) {
    return state.elapsed;
  }
  const now = performance.now();
  return state.elapsed + (now - state.startTimestamp);
}

function updateStatus() {
  statusText.textContent = state.running ? 'Running' : 'Paused';
  startPauseBtn.textContent = state.running ? 'Pause' : state.elapsed > 0 ? 'Resume' : 'Start';
  lapBtn.disabled = !state.running;
}

function renderLaps() {
  lapList.innerHTML = '';
  lapCount.textContent = state.laps.length;
  if (!state.laps.length) return;
  const lapDurations = state.laps.map(lap => lap.duration);
  const fastest = Math.min(...lapDurations);
  const slowest = Math.max(...lapDurations);

  state.laps.forEach((lap, index) => {
    const item = document.createElement('li');
    item.className = 'lap-item';
    if (lap.duration === fastest) item.classList.add('lap-item-fastest');
    if (lap.duration === slowest) item.classList.add('lap-item-slowest');

    const indexLabel = document.createElement('span');
    indexLabel.className = 'lap-index';
    indexLabel.textContent = `Lap ${index + 1}`;

    const lapValue = document.createElement('span');
    lapValue.className = 'lap-value';
    lapValue.textContent = formatTime(lap.duration);

    const deltaLabel = document.createElement('span');
    deltaLabel.className = 'lap-delta';
    deltaLabel.textContent = formatTime(lap.duration);

    item.append(indexLabel, lapValue, deltaLabel);
    lapList.appendChild(item);
  });
}

function addLap() {
  if (!state.running) return;
  const current = getCurrentElapsed();
  const previousTotal = state.laps.reduce((sum, lap) => sum + lap.duration, 0);
  const duration = current - previousTotal;
  state.laps.unshift({
    duration,
    previous: previousTotal,
    createdAt: Date.now(),
  });
  renderLaps();
  saveState();
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
  saveState();
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function startTimer() {
  if (state.running) return;
  playClickTone();
  state.running = true;
  state.startTimestamp = performance.now();
  updateStatus();
  lapBtn.disabled = false;
  animateFrame();
  saveState();
}

function pauseTimer() {
  if (!state.running) return;
  playClickTone();
  state.elapsed = getCurrentElapsed();
  state.running = false;
  state.startTimestamp = null;
  updateDisplay(state.elapsed);
  updateStatus();
  lapBtn.disabled = true;
  cancelAnimationFrame(state.animationFrameId);
  state.animationFrameId = null;
  saveState();
}

function resetTimer() {
  playClickTone();
  state.running = false;
  state.elapsed = 0;
  state.startTimestamp = null;
  state.laps = [];
  cancelAnimationFrame(state.animationFrameId);
  state.animationFrameId = null;
  updateDisplay(0);
  updateStatus();
  renderLaps();
  saveState();
}

function animateFrame() {
  if (!state.running) return;
  const elapsed = getCurrentElapsed();
  updateDisplay(elapsed);
  state.animationFrameId = requestAnimationFrame(animateFrame);
}

function handleStartPause() {
  state.running ? pauseTimer() : startTimer();
}

function handleKeyEvents(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.code === 'Space') {
    event.preventDefault();
    handleStartPause();
  }
  if (event.key.toLowerCase() === 'l') {
    event.preventDefault();
    if (!lapBtn.disabled) addLap();
  }
  if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    resetTimer();
  }
}

function hydrateUI() {
  updateDisplay(state.elapsed);
  updateStatus();
  renderLaps();
  setTheme(state.theme);
  if (state.running) {
    state.startTimestamp = performance.now();
    animateFrame();
  }
}

startPauseBtn.addEventListener('click', handleStartPause);
lapBtn.addEventListener('click', () => {
  playClickTone();
  addLap();
});
resetBtn.addEventListener('click', resetTimer);
themeToggle.addEventListener('click', () => {
  playClickTone();
  toggleTheme();
});
document.addEventListener('keydown', handleKeyEvents);

loadState();
hydrateUI();
