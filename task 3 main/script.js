/**
 * ============================================
 * LEARNFLOW - PREMIUM QUIZ ENGINE
 * Production-Grade Quiz Application
 * ============================================
 */

/**
 * QUESTION DATABASE
 * Comprehensive question data with categories, difficulty levels, and explanations
 */
const questionsData = [
  {
    id: 1,
    category: 'Product Design',
    difficulty: 'easy',
    question: 'What is the primary goal of user-centered design?',
    options: [
      'Maximizing the number of features',
      'Reducing production costs',
      'Solving real user needs',
      'Following design trends',
    ],
    answer: 'Solving real user needs',
    explanation: 'User-centered design focuses on understanding and solving the actual problems and needs of the target users, not just adding features or reducing costs.',
    timeLimit: 20,
  },
  {
    id: 2,
    category: 'Front-end Basics',
    difficulty: 'easy',
    question: 'Which HTML element should you use for the main title of a webpage?',
    options: ['<section>', '<h1>', '<main>', '<header>'],
    answer: '<h1>',
    explanation: 'The <h1> element is the semantic HTML5 element for the main heading of a page. There should typically be only one <h1> per page for SEO and accessibility.',
    timeLimit: 15,
  },
  {
    id: 3,
    category: 'JavaScript',
    difficulty: 'medium',
    question: 'What does DOM stand for?',
    options: ['Document Object Model', 'Data Object Model', 'Document Output Method', 'Dynamic Object Model'],
    answer: 'Document Object Model',
    explanation: 'The DOM (Document Object Model) is the in-memory representation of HTML that JavaScript can interact with. It allows you to dynamically access and modify elements.',
    timeLimit: 18,
  },
  {
    id: 4,
    category: 'Accessibility',
    difficulty: 'medium',
    question: 'Which attribute helps screen readers identify the purpose of a button?',
    options: ['aria-label', 'data-role', 'tabindex', 'role-id'],
    answer: 'aria-label',
    explanation: 'The aria-label attribute provides an accessible description for screen readers when the visual label isn\'t sufficient or when using icon buttons.',
    timeLimit: 18,
  },
  {
    id: 5,
    category: 'CSS Layout',
    difficulty: 'hard',
    question: 'Which CSS property is best for creating flexible, responsive layouts?',
    options: ['float', 'display', 'position', 'grid-template'],
    answer: 'display',
    explanation: 'The display property (with values like flex and grid) is the modern, flexible way to create responsive layouts. It\'s more reliable than floats or positioning.',
    timeLimit: 22,
  },
  {
    id: 6,
    category: 'Design Systems',
    difficulty: 'hard',
    question: 'A design token is used to store what type of value?',
    options: ['User preferences', 'Visual styling constants', 'API endpoints', 'Test cases'],
    answer: 'Visual styling constants',
    explanation: 'Design tokens are the visual decisions of a design system (colors, typography, spacing). They ensure consistency across products and enable easy theme switching.',
    timeLimit: 22,
  },
  {
    id: 7,
    category: 'Interaction',
    difficulty: 'easy',
    question: 'Which interaction pattern helps reduce user mistakes?',
    options: ['Infinite scroll', 'Progressive disclosure', 'Modal popups', 'Auto-play media'],
    answer: 'Progressive disclosure',
    explanation: 'Progressive disclosure reveals complex features gradually, reducing cognitive load and helping users avoid mistakes by limiting visible options.',
    timeLimit: 18,
  },
  {
    id: 8,
    category: 'Performance',
    difficulty: 'medium',
    question: 'What is a good first step when improving page speed?',
    options: ['Remove all images', 'Use responsive assets', 'Use inline styles only', 'Disable JavaScript'],
    answer: 'Use responsive assets',
    explanation: 'Serving correctly-sized images for different devices (responsive images) is one of the highest-impact optimizations. It reduces bandwidth without sacrificing quality.',
    timeLimit: 20,
  },
  {
    id: 9,
    category: 'Strategy',
    difficulty: 'hard',
    question: 'What metric measures how quickly users understand a product?',
    options: ['Conversion rate', 'Time to value', 'Bounce rate', 'Churn rate'],
    answer: 'Time to value',
    explanation: 'Time to value measures how long it takes users to experience value from a product. It\'s crucial for engagement and is superior to bounce rate for product quality.',
    timeLimit: 22,
  },
  {
    id: 10,
    category: 'Design Process',
    difficulty: 'easy',
    question: 'What is a user persona?',
    options: ['A product roadmap', 'A representation of target users', 'A software architecture model', 'A testing plan'],
    answer: 'A representation of target users',
    explanation: 'A user persona is a semi-fictional archetype of your target users based on research. It helps teams understand and empathize with user needs and behaviors.',
    timeLimit: 18,
  },
  {
    id: 11,
    category: 'JavaScript',
    difficulty: 'hard',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that closes the browser',
      'A function that has access to another function\'s variables',
      'A method to close connections',
      'An error handling mechanism'
    ],
    answer: 'A function that has access to another function\'s variables',
    explanation: 'A closure is created when a function has access to variables from another function\'s scope. This is fundamental to JavaScript and enables powerful patterns like callbacks.',
    timeLimit: 25,
  },
  {
    id: 12,
    category: 'Front-end Basics',
    difficulty: 'medium',
    question: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Code Style Standard'],
    answer: 'Cascading Style Sheets',
    explanation: 'CSS (Cascading Style Sheets) is the language for styling HTML. "Cascading" refers to how styles are inherited and overridden based on specificity and order.',
    timeLimit: 16,
  },
];

/**
 * APPLICATION STATE
 * Single source of truth for all quiz state
 */
const state = {
  // Question management
  questions: [],
  currentIndex: 0,
  
  // Scoring system
  score: 0,
  answers: [],
  totalTimeSpent: 0,
  
  // Timer system
  timer: null,
  timeRemaining: 0,
  questionStartTime: null,
  
  // User interaction state
  selectedOption: null,
  isAnswerRevealed: false,
  isAnswered: false,
  
  // Persistence
  highScore: 0,
  resumedSession: null,
};

/**
 * DOM ELEMENT CACHE
 * All DOM references stored in one place for easy access
 */
const elements = {
  // Screens
  welcomeScreen: document.getElementById('welcome-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultScreen: document.getElementById('result-screen'),

  // Welcome screen
  categorySelect: document.getElementById('category-select'),
  difficultySelect: document.getElementById('difficulty-select'),
  startButton: document.getElementById('start-button'),
  highScore: document.getElementById('high-score'),
  questionCount: document.getElementById('question-count'),

  // Quiz screen
  currentStep: document.getElementById('current-step'),
  totalSteps: document.getElementById('total-steps'),
  timerValue: document.getElementById('timer-value'),
  progressBar: document.getElementById('progress-bar'),
  questionCategory: document.getElementById('question-category'),
  questionText: document.getElementById('question-text'),
  optionsContainer: document.getElementById('options-container'),
  nextButton: document.getElementById('next-button'),

  // Results screen
  finalScore: document.getElementById('final-score'),
  finalPercentage: document.getElementById('final-percentage'),
  performanceMessage: document.getElementById('performance-message'),
  reviewPanel: document.getElementById('review-panel'),
  restartButton: document.getElementById('restart-button'),
};

/**
 * APPLICATION INITIALIZATION
 * Runs on page load - sets up categories, event listeners, and restoration
 */
function initializeApp() {
  // Build category dropdown
  const categories = Array.from(new Set(questionsData.map(q => q.category)));
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    elements.categorySelect.appendChild(option);
  });

  // Load persistent data from localStorage
  state.highScore = Number(localStorage.getItem('learnflowHighScore') || '0');
  elements.highScore.textContent = state.highScore;
  elements.questionCount.textContent = questionsData.length;

  // Restore session if available
  const savedSession = localStorage.getItem('learnflowSession');
  if (savedSession) {
    state.resumedSession = JSON.parse(savedSession);
    showResumePrompt();
  }

  // Attach event listeners
  elements.startButton.addEventListener('click', startQuiz);
  elements.nextButton.addEventListener('click', handleNextQuestion);
  elements.restartButton.addEventListener('click', resetQuiz);
}

/**
 * QUIZ INITIALIZATION
 * Prepares questions, shuffles them, and renders the first question
 */
function startQuiz() {
  const selectedCategory = elements.categorySelect.value;
  const selectedDifficulty = elements.difficultySelect.value;

  // Load filtered questions
  state.questions = loadQuestionSet(selectedCategory, selectedDifficulty);
  
  if (state.questions.length === 0) {
    alert('No questions found for the selected category and difficulty. Please try another option.');
    return;
  }

  // Reset state for new quiz
  state.currentIndex = 0;
  state.score = 0;
  state.answers = [];
  state.selectedOption = null;
  state.isAnswerRevealed = false;
  state.totalTimeSpent = 0;

  // Shuffle questions and options (Fisher-Yates algorithm)
  shuffleArray(state.questions);
  state.questions.forEach(question => shuffleArray(question.options));

  // Update UI
  elements.totalSteps.textContent = state.questions.length;
  showScreen(elements.quizScreen);
  
  // Render first question
  renderCurrentQuestion();
  updateProgress();
  startTimer();

  // Clear session restore on quiz start
  localStorage.removeItem('learnflowSession');
}

/**
 * FILTER QUESTIONS BY CATEGORY AND DIFFICULTY
 * Returns array of questions matching the criteria
 */
function loadQuestionSet(category, difficulty) {
  return questionsData.filter(question => {
    const categoryMatch = category === 'all' || question.category === category;
    const difficultyMatch = difficulty === 'all' || question.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });
}

/**
 * RENDER CURRENT QUESTION
 * Displays the question, options, and category/difficulty info
 */
function renderCurrentQuestion() {
  const currentQuestion = state.questions[state.currentIndex];
  if (!currentQuestion) return;

  // Reset state for new question
  state.isAnswerRevealed = false;
  state.isAnswered = false;
  state.questionStartTime = Date.now();

  // Update header info
  elements.questionCategory.innerHTML = `
    <span>${currentQuestion.category}</span>
    <span class="difficulty-tag difficulty-${currentQuestion.difficulty}">${capitalize(currentQuestion.difficulty)}</span>
  `;
  
  elements.questionText.textContent = currentQuestion.question;
  elements.currentStep.textContent = state.currentIndex + 1;
  
  // Clear previous options
  elements.optionsContainer.innerHTML = '';
  
  // Reset button state
  elements.nextButton.disabled = true;
  elements.nextButton.textContent = 'Next question';
  state.selectedOption = null;

  // Render option buttons
  currentQuestion.options.forEach(optionText => {
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'option-button';
    optionButton.textContent = optionText;
    optionButton.addEventListener('click', () => handleOptionSelect(optionButton, optionText));
    elements.optionsContainer.appendChild(optionButton);
  });
}

/**
 * HANDLE OPTION SELECTION
 * User clicks an answer option
 */
function handleOptionSelect(buttonElement, optionText) {
  // Prevent changing answer before feedback
  if (state.selectedOption) return;

  state.selectedOption = optionText;
  state.isAnswered = true;
  elements.nextButton.disabled = false;
  
  // Highlight selected option
  highlightSelected(buttonElement);
}

/**
 * HIGHLIGHT SELECTED OPTION
 * Visual feedback for selected answer
 */
function highlightSelected(selectedButton) {
  const buttons = elements.optionsContainer.querySelectorAll('.option-button');
  buttons.forEach(button => button.classList.remove('selected'));
  selectedButton.classList.add('selected');
}

/**
 * HANDLE NEXT BUTTON CLICK
 * Either reveals feedback or proceeds to next question
 */
function handleNextQuestion() {
  if (state.isAnswerRevealed) {
    proceedToNextStep();
    return;
  }
  if (!state.selectedOption) return;
  
  revealFeedback();
}

/**
 * REVEAL ANSWER FEEDBACK
 * Show correct/incorrect feedback with explanation
 */
function revealFeedback() {
  const currentQuestion = state.questions[state.currentIndex];
  const buttons = Array.from(elements.optionsContainer.querySelectorAll('.option-button'));

  // Disable all buttons and apply styling
  buttons.forEach(button => {
    const isCorrect = button.textContent === currentQuestion.answer;
    const isChosen = button.textContent === state.selectedOption;
    button.classList.add('disabled');
    
    if (isCorrect) button.classList.add('correct');
    if (isChosen && !isCorrect) button.classList.add('incorrect');
  });

  // Calculate score
  const isAnswerCorrect = state.selectedOption === currentQuestion.answer;
  if (isAnswerCorrect) state.score += 1;

  // Record answer with metadata
  const timeSpent = Math.round((Date.now() - state.questionStartTime) / 1000);
  state.totalTimeSpent += timeSpent;

  state.answers.push({
    question: currentQuestion.question,
    selected: state.selectedOption,
    correct: currentQuestion.answer,
    explanation: currentQuestion.explanation || '',
    category: currentQuestion.category,
    difficulty: currentQuestion.difficulty,
    wasCorrect: isAnswerCorrect,
    timeSpent: timeSpent,
  });

  // Show explanation
  showExplanation(currentQuestion.explanation, isAnswerCorrect);

  state.isAnswerRevealed = true;
  stopTimer();
  
  // Update button text
  const isLastQuestion = state.currentIndex + 1 === state.questions.length;
  elements.nextButton.textContent = isLastQuestion ? 'See results' : 'Next question';
  elements.nextButton.disabled = false;
}

/**
 * SHOW EXPLANATION
 * Displays answer explanation below the question
 */
function showExplanation(explanation, isCorrect) {
  // Remove any existing explanation
  const existingExplanation = elements.questionText.parentElement.querySelector('.explanation-box');
  if (existingExplanation) existingExplanation.remove();

  const explanationBox = document.createElement('div');
  explanationBox.className = `explanation-box ${isCorrect ? 'correct' : 'incorrect'}`;
  explanationBox.innerHTML = `
    <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
    <p>${explanation}</p>
  `;
  
  elements.questionText.parentElement.appendChild(explanationBox);
}

/**
 * PROCEED TO NEXT QUESTION
 * Increments question index or shows results
 */
function proceedToNextStep() {
  state.currentIndex += 1;
  
  if (state.currentIndex >= state.questions.length) {
    showResults();
    return;
  }

  // Reset timer for new question
  const nextQuestion = state.questions[state.currentIndex];
  state.timeRemaining = nextQuestion.timeLimit || 20;
  
  renderCurrentQuestion();
  updateProgress();
  startTimer();
}

/**
 * UPDATE PROGRESS BAR
 * Smooth progress visualization
 */
function updateProgress() {
  const progress = ((state.currentIndex) / state.questions.length) * 100;
  elements.progressBar.style.width = `${progress}%`;
}

/**
 * START TIMER
 * Countdown timer with auto-submit on expiry
 */
function startTimer() {
  const currentQuestion = state.questions[state.currentIndex];
  state.timeRemaining = currentQuestion.timeLimit || 20;
  
  updateTimerDisplay();
  
  state.timer = setInterval(() => {
    state.timeRemaining -= 1;
    updateTimerDisplay();
    
    // Change timer color when low
    const timerBox = document.querySelector('.timer-box');
    if (state.timeRemaining <= 5) {
      timerBox.classList.add('timer-urgent');
    } else {
      timerBox.classList.remove('timer-urgent');
    }

    if (state.timeRemaining <= 0) {
      handleTimerExpiry();
    }
  }, 1000);
}

/**
 * UPDATE TIMER DISPLAY
 */
function updateTimerDisplay() {
  elements.timerValue.textContent = `${state.timeRemaining}s`;
}

/**
 * STOP TIMER
 */
function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

/**
 * HANDLE TIMER EXPIRY
 * Auto-submit when time runs out
 */
function handleTimerExpiry() {
  stopTimer();
  
  const currentQuestion = state.questions[state.currentIndex];
  
  // Mark as timed out
  state.answers.push({
    question: currentQuestion.question,
    selected: null,
    correct: currentQuestion.answer,
    explanation: currentQuestion.explanation || '',
    category: currentQuestion.category,
    difficulty: currentQuestion.difficulty,
    wasCorrect: false,
    timedOut: true,
    timeSpent: currentQuestion.timeLimit || 20,
  });

  state.totalTimeSpent += (currentQuestion.timeLimit || 20);
  
  // Reveal correct answer
  revealTimeoutFeedback();
}

/**
 * REVEAL TIMEOUT FEEDBACK
 * Show correct answer when time expires
 */
function revealTimeoutFeedback() {
  const currentQuestion = state.questions[state.currentIndex];
  const buttons = Array.from(elements.optionsContainer.querySelectorAll('.option-button'));
  
  buttons.forEach(button => {
    const isCorrect = button.textContent === currentQuestion.answer;
    button.classList.add('disabled');
    if (isCorrect) button.classList.add('correct');
  });

  // Show explanation
  showExplanation(currentQuestion.explanation || '', false);

  state.isAnswerRevealed = true;
  elements.nextButton.disabled = false;
  
  const isLastQuestion = state.currentIndex + 1 === state.questions.length;
  elements.nextButton.textContent = isLastQuestion ? 'See results' : 'Next question';
}

/**
 * SHOW RESULTS
 * Display final score and detailed review
 */
function showResults() {
  stopTimer();
  
  // Calculate metrics
  const percentage = Math.round((state.score / state.questions.length) * 100);
  const minutes = Math.floor(state.totalTimeSpent / 60);
  const seconds = state.totalTimeSpent % 60;

  // Update results display
  elements.finalScore.textContent = `${state.score} / ${state.questions.length}`;
  elements.finalPercentage.textContent = `${percentage}%`;
  elements.performanceMessage.textContent = getPerformanceMessage(percentage);
  
  // Update high score
  updateHighScore(state.score);
  
  // Render detailed review
  renderReview(minutes, seconds);
  
  // Show results screen
  showScreen(elements.resultScreen);
}

/**
 * RENDER DETAILED REVIEW
 * Show each question with answer details
 */
function renderReview(minutes, seconds) {
  elements.reviewPanel.innerHTML = '';
  
  // Add summary stats
  const stats = document.createElement('div');
  stats.className = 'review-stats';
  stats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total time</span>
      <span class="stat-value">${minutes}m ${seconds}s</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Correct answers</span>
      <span class="stat-value">${state.score}/${state.questions.length}</span>
    </div>
  `;
  elements.reviewPanel.appendChild(stats);

  // Add each question review
  state.answers.forEach((entry, index) => {
    const reviewItem = document.createElement('article');
    reviewItem.className = 'review-item';

    const correctBadge = entry.wasCorrect 
      ? '<span class="review-badge correct">✓ Correct</span>'
      : entry.timedOut 
        ? '<span class="review-badge incorrect">⏱ Timed out</span>'
        : '<span class="review-badge incorrect">✗ Incorrect</span>';

    reviewItem.innerHTML = `
      <div class="review-header">
        <h3>Q${index + 1}. ${entry.question}</h3>
        <span class="difficulty-tag difficulty-${entry.difficulty}">${capitalize(entry.difficulty)}</span>
      </div>
      <div class="review-content">
        <div class="review-row">
          ${correctBadge}
          <span class="category-tag">${entry.category}</span>
        </div>
        <div class="answer-section">
          <div class="answer-item">
            <p class="answer-label">Your answer</p>
            <p class="answer-text ${entry.wasCorrect ? 'correct' : 'incorrect'}">
              ${entry.selected || '<em>No answer</em>'}
            </p>
          </div>
          <div class="answer-item">
            <p class="answer-label">Correct answer</p>
            <p class="answer-text correct">${entry.correct}</p>
          </div>
        </div>
        ${entry.explanation ? `
          <div class="explanation-content">
            <p class="explanation-label">Explanation</p>
            <p>${entry.explanation}</p>
          </div>
        ` : ''}
      </div>
    `;

    elements.reviewPanel.appendChild(reviewItem);
  });
}

/**
 * UPDATE HIGH SCORE
 * Track best score using localStorage
 */
function updateHighScore(score) {
  if (score <= state.highScore) return;
  state.highScore = score;
  localStorage.setItem('learnflowHighScore', String(score));
  elements.highScore.textContent = score;
}

/**
 * SHOW SCREEN
 * Screen navigation
 */
function showScreen(screen) {
  [elements.welcomeScreen, elements.quizScreen, elements.resultScreen].forEach(panel => {
    panel.classList.remove('active');
  });
  screen.classList.add('active');
}

/**
 * RESET QUIZ
 * Return to welcome screen
 */
function resetQuiz() {
  stopTimer();
  elements.nextButton.textContent = 'Next question';
  showScreen(elements.welcomeScreen);
}

/**
 * SHUFFLE ARRAY
 * Fisher-Yates shuffle algorithm for randomization
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * CAPITALIZE STRING
 * Utility function
 */
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * GET PERFORMANCE MESSAGE
 * Performance label based on percentage
 */
function getPerformanceMessage(percent) {
  if (percent >= 85) return 'Excellent work!';
  if (percent >= 70) return 'Good effort!';
  if (percent >= 50) return 'Solid progress';
  return 'Keep practicing!';
}

/**
 * SHOW RESUME PROMPT
 * Allow resuming a previous session
 */
function showResumePrompt() {
  const canResume = confirm(
    'You have an unfinished quiz. Would you like to resume?'
  );

  if (canResume && state.resumedSession) {
    restoreSession(state.resumedSession);
  }
}

/**
 * RESTORE SESSION
 * Resume a saved quiz session
 */
function restoreSession(session) {
  state.questions = session.questions;
  state.currentIndex = session.currentIndex;
  state.score = session.score;
  state.answers = session.answers;
  state.totalTimeSpent = session.totalTimeSpent;

  elements.totalSteps.textContent = state.questions.length;
  showScreen(elements.quizScreen);
  
  renderCurrentQuestion();
  updateProgress();
  startTimer();
}

/**
 * SAVE SESSION
 * Persist quiz progress to localStorage
 */
function saveSession() {
  const sessionData = {
    questions: state.questions,
    currentIndex: state.currentIndex,
    score: state.score,
    answers: state.answers,
    totalTimeSpent: state.totalTimeSpent,
  };
  localStorage.setItem('learnflowSession', JSON.stringify(sessionData));
}

/**
 * AUTO-SAVE SESSION
 * Save progress periodically during quiz
 */
setInterval(() => {
  if (state.questions.length > 0 && state.currentIndex < state.questions.length) {
    saveSession();
  }
}, 5000);

// ============================================
// INITIALIZE APP ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', initializeApp);
