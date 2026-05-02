// Storage utility for tasks and user preferences in localStorage
const Storage = (() => {
  const TASKS_KEY = 'focusflow.tasks';
  const SETTINGS_KEY = 'focusflow.settings';

  const saveTasks = tasks => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  };

  const loadTasks = () => {
    const raw = localStorage.getItem(TASKS_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn('Could not parse tasks from storage', error);
      return [];
    }
  };

  const saveSettings = settings => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  const loadSettings = () => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    try {
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  };

  return { saveTasks, loadTasks, saveSettings, loadSettings };
})();

// Business logic for task creation, filtering, sorting, and summaries
const TaskModel = (() => {
  const createTask = ({ text, dueDate, priority }) => ({
    id: crypto.randomUUID(),
    text: text.trim(),
    dueDate: dueDate || null,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  const getFilteredTasks = (tasks, filter, search) => {
    const query = search.trim().toLowerCase();
    return tasks.filter(task => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && task.completed) ||
        (filter === 'pending' && !task.completed);
      const matchesSearch =
        !query || task.text.toLowerCase().includes(query) ||
        (task.dueDate && task.dueDate.includes(query));
      return matchesFilter && matchesSearch;
    });
  };

  const sortTasks = (tasks, sortKey) => {
    const sorted = [...tasks];
    if (sortKey === 'due') {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortKey === 'priority') {
      const ranks = { high: 0, medium: 1, low: 2 };
      sorted.sort((a, b) => ranks[a.priority] - ranks[b.priority]);
    } else if (sortKey === 'status') {
      sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  };

  const getSummary = tasks => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    return { total, completed, pending: total - completed };
  };

  const getDueAlerts = tasks => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const due = new Date(task.dueDate);
      const diff = Math.floor((due - now) / (1000 * 60 * 60 * 24));
      return diff <= 1;
    });
  };

  return { createTask, getFilteredTasks, sortTasks, getSummary, getDueAlerts };
})();

// User interface helper: rendering, DOM references, theme states
const UI = (() => {
  const refs = {
    themeToggle: document.getElementById('themeToggle'),
    taskForm: document.getElementById('taskForm'),
    taskText: document.getElementById('taskText'),
    taskDueDate: document.getElementById('taskDueDate'),
    taskPriority: document.getElementById('taskPriority'),
    taskList: document.getElementById('taskList'),
    totalCount: document.getElementById('totalCount'),
    completedCount: document.getElementById('completedCount'),
    pendingCount: document.getElementById('pendingCount'),
    searchInput: document.getElementById('searchInput'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    sortSelect: document.getElementById('sortSelect'),
    dueAlert: document.getElementById('dueAlert'),
  };

  const getPriorityLabel = priority => {
    if (priority === 'high') return 'High';
    if (priority === 'medium') return 'Medium';
    return 'Low';
  };

  const renderSummary = summary => {
    refs.totalCount.textContent = summary.total;
    refs.completedCount.textContent = summary.completed;
    refs.pendingCount.textContent = summary.pending;
  };

  const renderDueAlert = alerts => {
    if (!alerts.length) {
      refs.dueAlert.classList.add('hidden');
      return;
    }

    const overdue = alerts.filter(task => new Date(task.dueDate) < new Date()).length;
    const urgent = alerts.length - overdue;
    refs.dueAlert.textContent = `You have ${alerts.length} due task${alerts.length === 1 ? '' : 's'}${overdue ? `, ${overdue} overdue` : ''}`;
    refs.dueAlert.classList.remove('hidden');
  };

  const createTaskItem = task => {
    const item = document.createElement('li');
    item.className = 'task-item';
    item.draggable = true;
    item.dataset.taskId = task.id;

    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'checkbox-wrap';
    checkboxWrapper.innerHTML = `<input type="checkbox" aria-label="Mark task complete" ${task.completed ? 'checked' : ''} />`;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const row = document.createElement('div');
    row.className = 'task-row';
    const text = document.createElement('p');
    text.className = `task-text ${task.completed ? 'completed' : ''}`;
    text.textContent = task.text;
    text.contentEditable = false;
    text.dataset.role = 'task-text';

    row.appendChild(text);
    meta.appendChild(row);

    const info = document.createElement('div');
    info.className = 'task-info';
    const due = document.createElement('span');
    due.className = 'badge';
    due.textContent = task.dueDate ? `Due ${task.dueDate}` : 'No due date';

    const priority = document.createElement('span');
    priority.className = `badge priority-${task.priority}`;
    priority.textContent = getPriorityLabel(task.priority);

    info.appendChild(due);
    info.appendChild(priority);
    meta.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    actions.innerHTML = `
      <button type="button" class="edit-btn" title="Edit task" aria-label="Edit task">✏️</button>
      <button type="button" class="delete-btn" title="Delete task" aria-label="Delete task">🗑️</button>
    `;

    item.append(checkboxWrapper, meta, actions);
    return item;
  };

  const renderTasks = tasks => {
    refs.taskList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    tasks.forEach(task => fragment.appendChild(createTaskItem(task)));
    refs.taskList.appendChild(fragment);
  };

  const setActiveFilter = filter => {
    refs.filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
  };

  const updateThemeIcon = theme => {
    refs.themeToggle.querySelector('.icon').textContent = theme === 'dark' ? '☀️' : '🌑';
  };

  return {
    refs,
    renderSummary,
    renderTasks,
    setActiveFilter,
    renderDueAlert,
    updateThemeIcon,
  };
})();

// Main application controller: state, events, and lifecycle handling
const App = (() => {
  let tasks = [];
  let settings = {
    filter: 'all',
    search: '',
    sort: 'created',
    theme: 'light',
  };

  const load = () => {
    tasks = Storage.loadTasks();
    const saved = Storage.loadSettings();
    settings = { ...settings, ...saved };
    applyTheme(settings.theme);
    UI.refs.searchInput.value = settings.search;
    UI.refs.sortSelect.value = settings.sort;
    UI.setActiveFilter(settings.filter);
    refresh();
  };

  const save = () => {
    Storage.saveTasks(tasks);
    Storage.saveSettings(settings);
  };

  const getVisibleTasks = () => {
    const filtered = TaskModel.getFilteredTasks(tasks, settings.filter, settings.search);
    return TaskModel.sortTasks(filtered, settings.sort);
  };

  const refresh = () => {
    const summary = TaskModel.getSummary(tasks);
    UI.renderSummary(summary);
    UI.renderTasks(getVisibleTasks());
    UI.renderDueAlert(TaskModel.getDueAlerts(tasks));
    save();
  };

  const addTask = event => {
    event.preventDefault();
    const text = UI.refs.taskText.value;
    const dueDate = UI.refs.taskDueDate.value;
    const priority = UI.refs.taskPriority.value;
    if (!text.trim()) return;

    tasks.unshift(TaskModel.createTask({ text, dueDate, priority }));
    UI.refs.taskForm.reset();
    settings.filter = 'all';
    UI.setActiveFilter(settings.filter);
    refresh();
  };

  const updateTaskStatus = (taskId, completed) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    task.completed = completed;
    refresh();
  };

  const deleteTask = taskId => {
    tasks = tasks.filter(item => item.id !== taskId);
    refresh();
  };

  const editTask = taskId => {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    const newText = prompt('Update task text', task.text);
    if (newText === null) return;
    task.text = newText.trim() || task.text;
    refresh();
  };

  const handleListClick = event => {
    const item = event.target.closest('.task-item');
    if (!item) return;
    const taskId = item.dataset.taskId;
    if (event.target.matches('.delete-btn')) {
      deleteTask(taskId);
      return;
    }
    if (event.target.matches('.edit-btn')) {
      editTask(taskId);
      return;
    }
    if (event.target.closest('.checkbox-wrap')) {
      const checkbox = item.querySelector('input[type="checkbox"]');
      updateTaskStatus(taskId, checkbox.checked);
    }
  };

  const setFilter = filter => {
    settings.filter = filter;
    UI.setActiveFilter(filter);
    save();
    refresh();
  };

  const setSearch = text => {
    settings.search = text;
    save();
    refresh();
  };

  const setSort = sortKey => {
    settings.sort = sortKey;
    save();
    refresh();
  };

  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    settings.theme = theme;
    UI.updateThemeIcon(theme);
    save();
  };

  const toggleTheme = () => {
    applyTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const attachDragEvents = () => {
    let draggedId = null;

    UI.refs.taskList.addEventListener('dragstart', event => {
      const item = event.target.closest('.task-item');
      if (!item) return;
      draggedId = item.dataset.taskId;
      item.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
    });

    UI.refs.taskList.addEventListener('dragend', event => {
      const item = event.target.closest('.task-item');
      if (item) item.classList.remove('dragging');
      draggedId = null;
    });

    UI.refs.taskList.addEventListener('dragover', event => {
      event.preventDefault();
      const item = event.target.closest('.task-item');
      if (!item || item.dataset.taskId === draggedId) return;
      const bounding = item.getBoundingClientRect();
      const offset = event.clientY - bounding.top;
      const next = offset > bounding.height / 2;
      const draggedItem = UI.refs.taskList.querySelector(`[data-task-id="${draggedId}"]`);
      if (!draggedItem) return;
      if (next) {
        item.after(draggedItem);
      } else {
        item.before(draggedItem);
      }
    });

    UI.refs.taskList.addEventListener('drop', event => {
      event.preventDefault();
      const orderedIds = Array.from(UI.refs.taskList.children).map(li => li.dataset.taskId);
      tasks = orderedIds.map(id => tasks.find(task => task.id === id)).filter(Boolean);
      save();
      refresh();
    });
  };

  const bindEvents = () => {
    UI.refs.themeToggle.addEventListener('click', toggleTheme);
    UI.refs.taskForm.addEventListener('submit', addTask);
    UI.refs.taskList.addEventListener('click', handleListClick);
    UI.refs.searchInput.addEventListener('input', event => setSearch(event.target.value));
    UI.refs.sortSelect.addEventListener('change', event => setSort(event.target.value));
    UI.refs.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
    attachDragEvents();
  };

  return { load, bindEvents };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.bindEvents();
  App.load();
});