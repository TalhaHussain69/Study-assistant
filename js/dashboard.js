/* ============================================================
   STUDY ASSISTANT — DASHBOARD JS (Per-User Data Integrated)
   Charts, Calendar Widget, Task Manager, Progress Circles
   ============================================================ */

'use strict';

let userData = null;

/* ── Init Dashboard ─────────────────────────────────────── */
const initDashboard = () => {
  userData = getUserData() || {};

  renderWelcomeMessage();

  // Draw line chart
  if (document.getElementById('main-chart')) {
    drawLineChart('main-chart', [
      { values: [2.5, 4, 3.2, 5.5, 4.8, 6.2, 3.8], color: '#6C63FF' },
      { values: [65, 72, 68, 80, 78, 88, 84].map(v => v / 15), color: '#00D4AA' }
    ], ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
  }

  if (document.getElementById('bar-chart')) {
    drawBarChart('bar-chart', [4, 7, 5, 9, 6, 8, 3], ['M','T','W','T','F','S','S'], '#6C63FF');
  }

  setTimeout(() => {
    setProgressCircle('prog-circle-1', 78);
    setProgressCircle('prog-circle-2', 62);
    setProgressCircle('prog-circle-3', 91);
  }, 400);

  if (document.getElementById('donut-chart')) {
    drawDonut('donut-chart', [
      { value: 40, color: '#6C63FF' },
      { value: 25, color: '#00D4AA' },
      { value: 20, color: '#FFB347' },
      { value: 15, color: '#FF5E7D' }
    ]);
  }

  initCalendarWidget();
  renderUserNotes();
  renderUserTasks();
  initQuickActions();
};

/* ── Welcome Message with real name ─────────────────────── */
const renderWelcomeMessage = () => {
  const user = getCurrentUser();
  const titleEl = document.querySelector('.topbar-title');
  if (titleEl && user) titleEl.textContent = `Welcome, ${user.name.split(' ')[0]}!`;
};

/* ── Render Notes from User Data ────────────────────────── */
const renderUserNotes = () => {
  const list = document.querySelector('.note-list');
  if (!list || !userData) return;
  const notes = (userData.notes || []).slice(-3).reverse();

  if (notes.length === 0) {
    list.innerHTML = `<p style="font-size:0.8rem;color:var(--txt-muted)">No notes yet. Create your first one!</p>`;
    return;
  }

  list.innerHTML = notes.map(n => `
    <div class="note-item" onclick="window.location.href='notes.html?id=${n.id}'">
      <div class="note-item-icon icon-violet" aria-hidden="true">${n.icon || '📘'}</div>
      <div>
        <div class="note-item-title">${escapeHtmlD(n.title)}</div>
        <div class="note-item-meta">Edited ${timeAgo(n.updatedAt)}</div>
      </div>
    </div>
  `).join('');
};

/* ── Task Manager (Per-User) ────────────────────────────── */
const renderUserTasks = () => {
  const taskList = document.getElementById('task-list');
  if (!taskList || !userData) return;
  const tasks = userData.tasks || [];

  taskList.innerHTML = tasks.map(t => `
    <div class="task-item">
      <button class="task-check ${t.done ? 'done' : ''}" data-task-id="${t.id}" aria-label="Mark task complete"></button>
      <span class="task-label ${t.done ? 'done' : ''}">${escapeHtmlD(t.label)}</span>
      <span class="task-due">${t.done ? 'Done' : t.due}</span>
    </div>
  `).join('');

  taskList.addEventListener('click', e => {
    const check = e.target.closest('.task-check');
    if (!check) return;
    const id = check.dataset.taskId;
    const task = userData.tasks.find(t => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveUserData(userData);
    renderUserTasks();
    toast(task.done ? '✅ Task completed!' : '↩️ Task reopened', task.done ? 'success' : 'info', 2000);
  }, { once: true });
};

/* ── Mini Calendar Widget ───────────────────────────────── */
const initCalendarWidget = () => {
  const widget = document.getElementById('cal-widget');
  if (!widget) return;

  const monthLabel = widget.querySelector('.cal-month');
  const grid       = widget.querySelector('.cal-grid-body');
  const prevBtn    = widget.querySelector('.cal-prev');
  const nextBtn    = widget.querySelector('.cal-next');
  if (!grid) return;

  const events = [5, 12, 18, 23, 27];
  let current = new Date();

  const render = () => {
    const year  = current.getFullYear();
    const month = current.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day muted';
      cell.textContent = new Date(year, month, -firstDay + i + 1).getDate();
      grid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'button');
      if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        cell.classList.add('today');
      }
      if (events.includes(d)) cell.classList.add('has-event');
      cell.addEventListener('click', () => toast(`📅 ${month + 1}/${d}/${year} selected`, 'info', 2000));
      grid.appendChild(cell);
    }
  };

  prevBtn && prevBtn.addEventListener('click', () => { current.setMonth(current.getMonth() - 1); render(); });
  nextBtn && nextBtn.addEventListener('click', () => { current.setMonth(current.getMonth() + 1); render(); });
  render();
};

/* ── Quick Actions ──────────────────────────────────────── */
const initQuickActions = () => {
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) window.location.href = page;
    });
  });
};

/* ── AI Prompt Chips ────────────────────────────────────── */
const initAIChips = () => {
  document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent.trim();
      window.location.href = `chat.html?q=${encodeURIComponent(text)}`;
    });
  });
};

/* ── Helpers ─────────────────────────────────────────────── */
const escapeHtmlD = (str) =>
  String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const timeAgo = (isoString) => {
  if (!isoString) return 'recently';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initAIChips();
});