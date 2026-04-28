/* Premium Calculator - modular, safe evaluation, keyboard support, history persistence */

const expressionDisplay = document.getElementById('expressionDisplay');
const resultDisplay = document.getElementById('resultDisplay');
const buttonGrid = document.getElementById('buttonGrid');
const historyList = document.getElementById('historyList');
const clearHistoryButton = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');
const displayPanel = document.getElementById('displayPanel');

const STORAGE_KEY = 'premium_calculator_history_v1';
const MAX_HISTORY = 8;

const state = {
  expression: '',
  readyForNewInput: false,
  error: false,
  history: [],
};

function initialize() {
  loadHistory();
  bindEvents();
  updateDisplay();
  restoreTheme();
}

function bindEvents() {
  buttonGrid.addEventListener('click', onButtonGridClick);
  clearHistoryButton.addEventListener('click', clearHistory);
  historyList.addEventListener('click', onHistoryClick);
  window.addEventListener('keydown', onKeyDown);
  themeToggle.addEventListener('click', toggleTheme);
}

function onButtonGridClick(event) {
  const button = event.target.closest('button');
  if (!button) return;
  playClickTone();

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action) {
    handleAction(action);
    return;
  }

  if (value) {
    handleInput(value);
  }
}

function handleAction(action) {
  if (state.error && action !== 'clear') {
    resetState();
  }

  switch (action) {
    case 'clear':
      clearAll();
      break;
    case 'delete':
      deleteLast();
      break;
    case 'decimal':
      appendDecimal();
      break;
    case 'equals':
      evaluateFinal();
      break;
    case 'percent':
      applyPercent();
      break;
    case 'toggle-sign':
      toggleSign();
      break;
  }
}

function handleInput(value) {
  if (state.error) {
    resetState();
  }

  if (isOperator(value)) {
    appendOperator(value);
    return;
  }

  appendNumber(value);
}

function appendNumber(digit) {
  if (state.readyForNewInput) {
    state.expression = digit;
    state.readyForNewInput = false;
  } else if (state.expression === '0') {
    state.expression = digit;
  } else {
    state.expression += digit;
  }

  updateDisplay();
}

function appendOperator(operator) {
  if (!state.expression && operator !== '-') {
    return;
  }

  if (state.readyForNewInput) {
    state.readyForNewInput = false;
  }

  if (!state.expression) {
    state.expression = operator;
    updateDisplay();
    return;
  }

  const lastChar = state.expression.slice(-1);
  if (isOperator(lastChar)) {
    state.expression = state.expression.slice(0, -1) + operator;
  } else {
    state.expression += operator;
  }

  updateDisplay();
}

function appendDecimal() {
  const currentOperand = getCurrentOperand();
  if (currentOperand.includes('.')) return;

  if (state.readyForNewInput || !state.expression || isOperator(state.expression.slice(-1))) {
    state.expression += '0.';
  } else {
    state.expression += '.';
  }

  state.readyForNewInput = false;
  updateDisplay();
}

function applyPercent() {
  const operand = getCurrentOperand();
  if (!operand) return;

  const percentValue = Number(operand) / 100;
  if (!Number.isFinite(percentValue)) return;

  const replacement = String(percentValue);
  state.expression = state.expression.slice(0, state.expression.length - operand.length) + replacement;
  updateDisplay();
}

function toggleSign() {
  const operand = getCurrentOperand();
  if (!operand) {
    state.expression += '-';
    updateDisplay();
    return;
  }

  const startIndex = state.expression.length - operand.length;
  const toggled = operand.startsWith('-') ? operand.slice(1) : `-${operand}`;
  state.expression = state.expression.slice(0, startIndex) + toggled;
  updateDisplay();
}

function deleteLast() {
  if (!state.expression || state.readyForNewInput) {
    clearAll();
    return;
  }

  state.expression = state.expression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  resetState();
  updateDisplay();
}

function resetState() {
  state.expression = '';
  state.error = false;
  state.readyForNewInput = false;
  displayPanel.classList.remove('error');
}

function evaluateFinal() {
  if (!state.expression) return;

  const result = tryEvaluate(state.expression);
  if (result === null) {
    showError('Invalid expression');
    return;
  }

  if (!Number.isFinite(result)) {
    showError('Cannot divide by zero');
    return;
  }

  const formatted = formatResult(result);
  addHistory(state.expression, formatted);
  state.expression = formatted;
  state.readyForNewInput = true;
  updateDisplay();
}

function updateDisplay() {
  expressionDisplay.textContent = state.expression || '0';
  const preview = buildPreview();
  resultDisplay.textContent = preview;
}

function buildPreview() {
  if (!state.expression) return '0';

  const trimmedExpression = trimTrailingOperators(state.expression);
  if (!trimmedExpression) return '0';

  const result = tryEvaluate(trimmedExpression);
  if (result === null || result === Infinity || result === -Infinity) return '0';
  return formatResult(result);
}

function trimTrailingOperators(expression) {
  return expression.replace(/[+\-*/]+$/g, '');
}

function getCurrentOperand() {
  const match = state.expression.match(/([+\-*/])?([^+\-*/]+)$/);
  return match ? match[2] : '';
}

function isOperator(char) {
  return ['+', '-', '*', '/'].includes(char);
}

function tryEvaluate(expression) {
  const tokens = tokenizeExpression(expression);
  if (!tokens) return null;
  const postfix = infixToPostfix(tokens);
  if (!postfix) return null;
  return evaluatePostfix(postfix);
}

function tokenizeExpression(expression) {
  const tokens = [];
  let numberBuffer = '';

  const pushNumber = () => {
    if (!numberBuffer) return;
    if (numberBuffer === '.' || numberBuffer === '-.' || numberBuffer === '+.') return null;
    if (numberBuffer.split('.').length > 2) return null;
    tokens.push(numberBuffer);
    numberBuffer = '';
  };

  for (let i = 0; i < expression.length; i += 1) {
    const char = expression[i];

    if (char >= '0' && char <= '9' || char === '.') {
      numberBuffer += char;
      continue;
    }

    if (isOperator(char)) {
      if (numberBuffer === '' && (char === '+' || char === '-') ) {
        const prev = tokens[tokens.length - 1];
        if (!prev || isOperator(prev)) {
          numberBuffer = char;
          continue;
        }
      }

      if (numberBuffer === '' && !tokens.length) return null;
      pushNumber();
      tokens.push(char);
      continue;
    }

    return null;
  }

  pushNumber();
  return tokens.length ? tokens : null;
}

function infixToPostfix(tokens) {
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output = [];
  const operators = [];

  for (const token of tokens) {
    if (isOperator(token)) {
      while (operators.length) {
        const top = operators[operators.length - 1];
        if (isOperator(top) && precedence[top] >= precedence[token]) {
          output.push(operators.pop());
          continue;
        }
        break;
      }
      operators.push(token);
    } else {
      output.push(token);
    }
  }

  while (operators.length) {
    const op = operators.pop();
    if (!isOperator(op)) return null;
    output.push(op);
  }

  return output;
}

function evaluatePostfix(postfix) {
  const stack = [];

  for (const token of postfix) {
    if (isOperator(token)) {
      const right = Number(stack.pop());
      const left = Number(stack.pop());
      if (!Number.isFinite(left) || !Number.isFinite(right)) return null;

      switch (token) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          if (right === 0) return Infinity;
          stack.push(left / right);
          break;
        default:
          return null;
      }
    } else {
      stack.push(token);
    }
  }

  return stack.length === 1 ? Number(stack[0]) : null;
}

function formatResult(value) {
  if (!Number.isFinite(value)) return 'Error';
  const absValue = Math.abs(value);
  if (absValue >= 1e12 || (absValue > 0 && absValue < 1e-9)) {
    return value.toExponential(9).replace(/(?:\.0+|(?<=\.[0-9]*[1-9])0+)$/, '');
  }
  const formatted = String(Number(value.toFixed(12)));
  return formatted;
}

function showError(message) {
  state.error = true;
  displayPanel.classList.add('error');
  resultDisplay.textContent = message;
}

function addHistory(expression, result) {
  const entry = { expression, result };
  state.history = [entry, ...state.history.filter(item => item.expression !== expression)];
  if (state.history.length > MAX_HISTORY) {
    state.history.length = MAX_HISTORY;
  }
  saveHistory();
  renderHistory();
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(stored)) {
      state.history = stored;
    }
  } catch (error) {
    state.history = [];
  }
  renderHistory();
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!state.history.length) {
    historyList.innerHTML = '<div class="history-entry"><div class="history-entry__expression">No saved calculations yet.</div></div>';
    return;
  }

  for (const item of state.history) {
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'history-entry';
    entry.dataset.expression = item.expression;
    entry.innerHTML = `
      <div class="history-entry__expression">${item.expression}</div>
      <div class="history-entry__result">${item.result}</div>
    `;
    historyList.appendChild(entry);
  }
}

function clearHistory() {
  state.history = [];
  saveHistory();
  renderHistory();
}

function onHistoryClick(event) {
  const item = event.target.closest('.history-entry');
  if (!item || !item.dataset.expression) return;
  state.expression = item.dataset.expression;
  state.readyForNewInput = false;
  state.error = false;
  displayPanel.classList.remove('error');
  updateDisplay();
}

function onKeyDown(event) {
  const { key } = event;
  if (key >= '0' && key <= '9') {
    event.preventDefault();
    handleInput(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();
    handleInput(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateFinal();
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    deleteLast();
    return;
  }

  if (key === 'Escape' || key === 'c' || key === 'C') {
    event.preventDefault();
    clearAll();
    return;
  }

  if (key === '.' || key === ',') {
    event.preventDefault();
    appendDecimal();
    return;
  }

  if (key === '%') {
    event.preventDefault();
    applyPercent();
    return;
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  themeToggle.querySelector('.theme-toggle__icon').textContent = isLight ? '☀️' : '🌙';
  themeToggle.querySelector('.theme-toggle__text').textContent = isLight ? 'Dark mode' : 'Light mode';
  localStorage.setItem('premium_calculator_theme', isLight ? 'light' : 'dark');
}

function restoreTheme() {
  const storedTheme = localStorage.getItem('premium_calculator_theme');
  if (storedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.querySelector('.theme-toggle__icon').textContent = '☀️';
    themeToggle.querySelector('.theme-toggle__text').textContent = 'Dark mode';
  }
}

function playClickTone() {
  if (!window.AudioContext) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.frequency.value = 450;
    gain.gain.value = 0.02;
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.03);
  } catch (error) {
    // Audio might be blocked by browser policy.
  }
}

initialize();
