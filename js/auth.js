'use strict';

const AUTH_USERS_KEY    = 'sa_users';        
const AUTH_SESSION_KEY  = 'sa_session';       


const getUsers = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {}; }
  catch { return {}; }
};

const saveUsers = (users) => localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));


const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36);
};

const randomAvatarColor = () => {
  const colors = [
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
    'linear-gradient(135deg,#6C63FF,#00D4AA)',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const initials = (name) =>
  name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();


window.registerUser = ({ name, email, password }) => {
  email = email.trim().toLowerCase();
  const users = getUsers();

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }
  if (users[email]) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  users[email] = {
    name,
    email,
    password: simpleHash(password),
    createdAt: new Date().toISOString(),
    avatarColor: randomAvatarColor(),
    plan: 'Free Plan',
    bio: '',
  };
  saveUsers(users);

 
  seedUserData(email, name);

 
  localStorage.setItem(AUTH_SESSION_KEY, email);

  return { success: true, message: 'Account created successfully!' };
};


window.loginUser = ({ email, password }) => {
  email = email.trim().toLowerCase();
  const users = getUsers();
  const user = users[email];

  if (!user) {
    return { success: false, message: 'No account found with this email.' };
  }
  if (user.password !== simpleHash(password)) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  localStorage.setItem(AUTH_SESSION_KEY, email);
  return { success: true, message: `Welcome back, ${user.name}!` };
};


window.logoutUser = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.location.href = 'login.html';
};


window.getCurrentUser = () => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (!email) return null;
  const users = getUsers();
  return users[email] || null;
};

window.updateCurrentUser = (updates) => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (!email) return false;
  const users = getUsers();
  if (!users[email]) return false;
  users[email] = { ...users[email], ...updates };
  saveUsers(users);
  return true;
};

window.changePassword = (oldPassword, newPassword) => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  const users = getUsers();
  const user = users[email];
  if (!user) return { success: false, message: 'Not logged in.' };
  if (user.password !== simpleHash(oldPassword)) {
    return { success: false, message: 'Current password is incorrect.' };
  }
  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' };
  }
  users[email].password = simpleHash(newPassword);
  saveUsers(users);
  return { success: true, message: 'Password updated successfully.' };
};

window.deleteCurrentUser = () => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (!email) return;
  const users = getUsers();
  delete users[email];
  saveUsers(users);
  localStorage.removeItem(`sa_data_${email}`);
  localStorage.removeItem(AUTH_SESSION_KEY);
};


window.requireAuth = () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
};


const dataKey = (email) => `sa_data_${email}`;

const seedUserData = (email, name) => {
  const seed = {
    notes: [
      {
        id: 'n1',
        title: 'Welcome to StudyAI! 🎓',
        body: `Hi ${name}!\n\nThis is your first note. Click any note in the sidebar to edit it, or create a new one using the "+ New Note" button.\n\nYour notes, flashcards, quiz scores and study progress are all saved automatically to your account.`,
        icon: '📘',
        updatedAt: new Date().toISOString(),
      },
    ],
    tasks: [
      { id: 't1', label: 'Explore the AI Chat', done: false, due: 'Today' },
      { id: 't2', label: 'Create your first note', done: false, due: 'Today' },
      { id: 't3', label: 'Try the Quiz Generator', done: false, due: 'This week' },
    ],
    quizScores: [],
    flashcardStats: { mastered: 0, learning: 0, needsReview: 0 },
    studyStreak: 1,
    studyMinutes: 0,
    chatHistory: [],
    events: [],
  };
  localStorage.setItem(dataKey(email), JSON.stringify(seed));
};

window.getUserData = () => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (!email) return null;
  try {
    return JSON.parse(localStorage.getItem(dataKey(email))) || null;
  } catch { return null; }
};

window.saveUserData = (data) => {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (!email) return false;
  localStorage.setItem(dataKey(email), JSON.stringify(data));
  return true;
};

window.updateUserData = (updates) => {
  const data = getUserData() || {};
  const merged = { ...data, ...updates };
  saveUserData(merged);
  return merged;
};


window.renderSidebarUser = () => {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-plan]').forEach(el => el.textContent = user.plan || 'Free Plan');
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
  document.querySelectorAll('[data-user-avatar]').forEach(el => {
    el.textContent = initials(user.name);
    el.style.background = user.avatarColor || 'var(--grad-primary)';
  });
};


document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  });
});