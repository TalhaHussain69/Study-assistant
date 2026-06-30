

'use strict';

const AI_RESPONSES = [
  "Great question! Let me break this down for you step by step. The concept you're asking about involves several interconnected ideas that build on each other.",
  "Based on your query, I'd suggest starting with the fundamentals. Understanding the core principles will make the advanced topics much clearer.",
  "I can help you with that! Here's a concise explanation along with some examples to make it easier to grasp.",
  "Excellent topic for study! This is a key concept that frequently appears in exams. Let me give you a clear, memorable explanation.",
  "Let me generate a summary and some practice questions to reinforce your understanding of this material.",
  "I've analyzed your question. Here's what you need to know — I'll also suggest some related topics you might want to explore.",
];

let messageCount = 0;
let isTyping = false;
let chatHistory = [];


const loadChatHistory = () => {
  const data = getUserData() || {};
  chatHistory = data.chatHistory || [];

  const container = document.getElementById('chat-messages');
  if (!container) return;

  if (chatHistory.length === 0) {
    return; 
  }

  container.innerHTML = '';
  chatHistory.forEach(msg => {
    renderMessage(msg.content, msg.role, msg.time, false); 
  });


  const prompts = document.getElementById('suggested-prompts');
  if (prompts && chatHistory.length > 0) prompts.style.display = 'none';
};

const persistChatHistory = (content, role, time) => {
  chatHistory.push({ content, role, time });
  
  if (chatHistory.length > 50) chatHistory = chatHistory.slice(-50);
  const data = getUserData() || {};
  data.chatHistory = chatHistory;
  saveUserData(data);
};


const renderMessage = (content, role = 'ai', time = null, shouldSave = true) => {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const timestamp = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const user = getCurrentUser();
  const userInitial = user ? initialsLocal(user.name) : '😊';

  if (role === 'ai') {
    wrap.innerHTML = `
      <div class="avatar avatar-sm" style="background:var(--grad-primary);flex-shrink:0;margin-top:4px" aria-label="AI Assistant">🤖</div>
      <div>
        <div class="msg-bubble">${content}</div>
        <div class="msg-meta">AI Assistant · ${timestamp}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)" title="Copy response">📋 Copy</button>
          <button class="msg-action-btn" onclick="regenMsg(this)" title="Regenerate">🔄 Regenerate</button>
          <button class="msg-action-btn" title="Good response">👍</button>
          <button class="msg-action-btn" title="Bad response">👎</button>
        </div>
      </div>`;
  } else {
    wrap.innerHTML = `
      <div>
        <div class="msg-bubble">${content}</div>
        <div class="msg-meta" style="text-align:right">${timestamp}</div>
      </div>
      <div class="avatar avatar-sm" data-user-avatar style="background:${user ? user.avatarColor : 'var(--grad-warm)'};flex-shrink:0;margin-top:4px" aria-label="You">${userInitial}</div>`;
  }

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  messageCount++;

  if (shouldSave) persistChatHistory(content, role, timestamp);
};

const initialsLocal = (name) =>
  name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();


const showTyping = () => {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'msg ai';
  el.id = 'typing-msg';
  el.innerHTML = `
    <div class="avatar avatar-sm" style="background:var(--grad-primary);flex-shrink:0;margin-top:4px">🤖</div>
    <div>
      <div class="msg-bubble">
        <div class="loading-dots" aria-label="AI is thinking">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="msg-meta">AI is thinking…</div>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
};

const hideTyping = () => {
  const el = document.getElementById('typing-msg');
  if (el) el.remove();
};


const sendMessage = async (text) => {
  const input = document.getElementById('chat-input');
  const msg   = (text || (input && input.value.trim()));
  if (!msg || isTyping) return;

  if (input) input.value = '';
  adjustTextarea(input);
  renderMessage(escapeHtml(msg), 'user');

  const prompts = document.getElementById('suggested-prompts');
  if (prompts && messageCount === 1) {
    prompts.style.transition = 'opacity .3s';
    prompts.style.opacity = '0';
    setTimeout(() => prompts.style.display = 'none', 300);
  }

  isTyping = true;
  showTyping();

  const delay = 1000 + Math.random() * 1500;
  await new Promise(r => setTimeout(r, delay));

  hideTyping();
  const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
  renderMessage(response, 'ai');
  isTyping = false;

  const data = getUserData() || {};
  data.studyMinutes = (data.studyMinutes || 0) + 1;
  saveUserData(data);
};

window.copyMsg = (btn) => {
  const bubble = btn.closest('div').previousElementSibling;
  navigator.clipboard.writeText(bubble.textContent).then(() => toast('📋 Copied to clipboard', 'success', 2000));
};

window.regenMsg = async (btn) => {
  const parentDiv = btn.closest('div');
  const bubble = parentDiv.previousElementSibling;
  bubble.style.opacity = '.4';
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 800));
  const newText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
  bubble.textContent = newText;
  bubble.style.opacity = '1';
  toast('🔄 Response regenerated', 'info', 2000);

  if (chatHistory.length > 0) {
    const lastAiIndex = [...chatHistory].reverse().findIndex(m => m.role === 'ai');
    if (lastAiIndex !== -1) {
      const realIndex = chatHistory.length - 1 - lastAiIndex;
      chatHistory[realIndex].content = newText;
      const data = getUserData() || {};
      data.chatHistory = chatHistory;
      saveUserData(data);
    }
  }
};

window.clearChatHistory = () => {
  document.getElementById('chat-messages').innerHTML = '';
  chatHistory = [];
  const data = getUserData() || {};
  data.chatHistory = [];
  saveUserData(data);
  messageCount = 0;
  const prompts = document.getElementById('suggested-prompts');
  if (prompts) prompts.style.display = 'flex';
  toast('🗑️ Chat history cleared', 'info', 2000);
  setTimeout(() => {
    renderMessage("👋 Chat cleared! What would you like to study now?", 'ai');
  }, 300);
};

const adjustTextarea = (el) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
};

const initFileUpload = () => {
  const fileBtn   = document.getElementById('file-upload-btn');
  const fileInput = document.getElementById('file-input');
  if (!fileBtn || !fileInput) return;

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  fileBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = escapeHtml(file.name);
    const size = (file.size / 1024).toFixed(1);
    fileInput.value = '';

    renderMessage(`📎 <strong>${name}</strong> (${size} KB) — Please analyze this file for me.`, 'user');
    toast(`📄 Reading ${name}…`, 'info', 2000);

    isTyping = true;
    showTyping();

    try {
      let extractedText = '';

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractPdfText(file);
      } else if (
        file.type === 'text/plain' ||
        file.name.toLowerCase().endsWith('.txt') ||
        file.name.toLowerCase().endsWith('.md')
      ) {
        extractedText = await file.text();
      } else if (
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        hideTyping();
        renderMessage(`I received <strong>${name}</strong>, but Word document reading isn't supported in this demo yet. Please try uploading a PDF or TXT file instead.`, 'ai');
        isTyping = false;
        return;
      } else if (file.type.startsWith('image/')) {
        hideTyping();
        renderMessage(`I can see you've uploaded an image (<strong>${name}</strong>). Image content analysis isn't available in this demo, but you can describe what's in the image and I'll help you study it!`, 'ai');
        isTyping = false;
        return;
      } else {
        hideTyping();
        renderMessage(`I received <strong>${name}</strong>, but I can only read PDF and TXT files in this demo. Please try one of those formats.`, 'ai');
        isTyping = false;
        return;
      }

      if (!extractedText || extractedText.trim().length === 0) {
        hideTyping();
        renderMessage(`I opened <strong>${name}</strong> but couldn't find any readable text inside it. It might be a scanned/image-based PDF.`, 'ai');
        isTyping = false;
        return;
      }

      const summary = summarizeText(extractedText);

      await new Promise(r => setTimeout(r, 600)); 
      hideTyping();

      renderMessage(
        `📄 Here's a summary of <strong>${name}</strong>:<br><br>${summary}<br><br>
        <em>Document length: ~${extractedText.trim().split(/\s+/).length} words.</em><br>
        Want me to create flashcards or a quiz from this content? Just ask!`,
        'ai'
      );
    } catch (err) {
      console.error(err);
      hideTyping();
      renderMessage(`Sorry, I ran into an error while reading <strong>${name}</strong>. Please make sure it's a valid file and try again.`, 'ai');
    }

    isTyping = false;
  });
};

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  const maxPages = Math.min(pdf.numPages, 25);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}


function summarizeText(text, maxSentences = 5) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];

  if (sentences.length <= maxSentences) {
    return escapeHtml(clean.slice(0, 800));
  }


  const stopwords = new Set(['the','a','an','is','are','was','were','of','to','in','on','for','and','or','with','as','by','this','that','it','at','be','from','which','has','have','had']);
  const freq = {};
  clean.toLowerCase().split(/\W+/).forEach(word => {
    if (word.length > 2 && !stopwords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });


  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().split(/\W+/);
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / (words.length || 1);
    return { sentence: s.trim(), score, idx };
  });


  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx);

  return top.map(s => '• ' + escapeHtml(s.sentence)).join('<br>');
}


const initVoice = () => {
  const voiceBtn = document.getElementById('voice-btn');
  if (!voiceBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice input not supported in this browser';
    voiceBtn.style.opacity = '.4';
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.interimResults = false;
  let recording = false;

  voiceBtn.addEventListener('click', () => {
    if (recording) { rec.stop(); return; }
    rec.start();
    recording = true;
    voiceBtn.textContent = '⏹️';
    voiceBtn.style.background = 'rgba(255,94,125,.2)';
    toast('🎙️ Listening… speak now', 'info', 5000);
  });

  rec.addEventListener('result', e => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) { input.value = text; adjustTextarea(input); }
    toast(`🎙️ "${text}"`, 'success', 3000);
  });

  rec.addEventListener('end', () => {
    recording = false;
    voiceBtn.textContent = '🎙️';
    voiceBtn.style.background = '';
  });
};

const initSuggestedPrompts = () => {
  document.querySelectorAll('.suggested-prompt').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.textContent.trim()));
  });
};

const prefillFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) setTimeout(() => sendMessage(q), 500);
};

const escapeHtml = str =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

document.addEventListener('DOMContentLoaded', () => {
  const input  = document.getElementById('chat-input');
  const sendBtn= document.getElementById('send-btn');

  if (input) {
    input.addEventListener('input', () => adjustTextarea(input));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  sendBtn && sendBtn.addEventListener('click', () => sendMessage());

  initFileUpload();
  initVoice();
  initSuggestedPrompts();

  loadChatHistory();

  if (chatHistory.length === 0) {
    const user = getCurrentUser();
    const name = user ? user.name.split(' ')[0] : 'there';
    setTimeout(() => {
      renderMessage(`👋 Hi ${name}! I'm your AI Study Assistant. I can help you understand complex topics, generate quizzes, summarize notes, create flashcards, and much more. What would you like to study today?`, 'ai');
    }, 300);
  }

  prefillFromURL();
});