let selectedApproach = [];
let currentQuestionIndex = 0;
let journalEntries = [];
let approaches = {};
let totalQuestions = 0;

fetch('questions.json')
  .then(r => r.json())
  .then(data => { approaches = data; })
  .catch(err => console.error('Error loading questions:', err));

// ---- Notion settings (persisted in localStorage) ----
function loadNotionSettings() {
  return {
    token:  localStorage.getItem('notion_token')   || '',
    pageId: localStorage.getItem('notion_page_id') || ''
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const { token, pageId } = loadNotionSettings();
  if (token)  document.getElementById('notion-token').value   = token;
  if (pageId) document.getElementById('notion-page-id').value = pageId;
});

document.getElementById('notion-settings-btn').addEventListener('click', () => {
  document.getElementById('notion-settings-panel').classList.toggle('hidden');
});

document.getElementById('save-notion-settings').addEventListener('click', () => {
  const token  = document.getElementById('notion-token').value.trim();
  const pageId = document.getElementById('notion-page-id').value.trim();
  localStorage.setItem('notion_token',   token);
  localStorage.setItem('notion_page_id', pageId);
  document.getElementById('notion-settings-panel').classList.add('hidden');
  const btn = document.getElementById('save-notion-settings');
  const orig = btn.textContent;
  btn.textContent = 'Saved ✦';
  setTimeout(() => { btn.textContent = orig; }, 2000);
});

// ---- Start ----
document.getElementById('start-button').addEventListener('click', () => {
  const checked = document.querySelectorAll('input[name="approach"]:checked');
  if (checked.length === 0) {
    document.getElementById('journal-form').classList.add('shake');
    setTimeout(() => document.getElementById('journal-form').classList.remove('shake'), 400);
    return;
  }

  selectedApproach = [];
  checked.forEach(box => {
    selectedApproach = selectedApproach.concat(approaches[box.value] || []);
  });
  totalQuestions = selectedApproach.length;

  document.getElementById('instruction-page').classList.add('hidden');
  document.getElementById('question-container').classList.remove('hidden');
  displayNextQuestion();
});

function displayNextQuestion() {
  if (currentQuestionIndex >= selectedApproach.length) {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('finish-container').classList.remove('hidden');
    return;
  }

  document.getElementById('question').textContent = selectedApproach[currentQuestionIndex];
  document.getElementById('answer').value = '';

  const pct = (currentQuestionIndex / totalQuestions) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${currentQuestionIndex + 1} / ${totalQuestions}`;

  const isLast = currentQuestionIndex === selectedApproach.length - 1;
  document.getElementById('next-btn-text').textContent = isLast ? 'Finish' : 'Continue';

  setTimeout(() => document.getElementById('answer').focus(), 100);
}

document.getElementById('next-button').addEventListener('click', () => {
  const answer = document.getElementById('answer').value;
  if (answer.trim() === '') {
    document.getElementById('answer').classList.add('shake');
    setTimeout(() => document.getElementById('answer').classList.remove('shake'), 400);
    return;
  }
  journalEntries.push({ question: selectedApproach[currentQuestionIndex], answer: answer.trim() });
  currentQuestionIndex++;
  displayNextQuestion();
});

document.getElementById('skip-button').addEventListener('click', () => {
  journalEntries.push({ question: selectedApproach[currentQuestionIndex], answer: '—' });
  currentQuestionIndex++;
  displayNextQuestion();
});

// ---- Formatting ----
function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatEntries() {
  return journalEntries.map(e => `## ${e.question}\n${e.answer}\n\n`).join('');
}

function formatForNotion() {
  const date = getDateString();
  return `# Journal Entry — ${date}\n\n` +
    journalEntries.map(e => `## ${e.question}\n\n${e.answer}\n\n---\n\n`).join('');
}

// ---- Copy for Notion ----
document.getElementById('copy-for-notion-button').addEventListener('click', async () => {
  const content = formatForNotion();
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = content;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  const el = document.getElementById('notion-copy-success');
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 9000);
});

// ---- Send to Notion via API ----
document.getElementById('send-to-notion-button').addEventListener('click', async () => {
  const { token, pageId } = loadNotionSettings();
  if (!token || !pageId) {
    document.getElementById('notion-setup-reminder').classList.remove('hidden');
    return;
  }

  const statusEl = document.getElementById('notion-api-status');
  statusEl.className = 'status-msg';
  statusEl.textContent = 'Connecting to Notion…';
  statusEl.classList.remove('hidden');

  const date = getDateString();
  const blocks = [];
  journalEntries.forEach(entry => {
    blocks.push({
      object: 'block', type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: entry.question } }] }
    });
    blocks.push({
      object: 'block', type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: entry.answer } }] }
    });
    blocks.push({ object: 'block', type: 'divider', divider: {} });
  });

  const payload = {
    parent: { page_id: pageId.replace(/-/g, '') },
    properties: {
      title: { title: [{ text: { content: `Journal Entry — ${date}` } }] }
    },
    children: blocks
  };

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      statusEl.classList.add('success');
      statusEl.textContent = 'Saved to Notion ✦';
    } else {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
  } catch (err) {
    statusEl.classList.add('error');
    if (err.name === 'TypeError') {
      statusEl.textContent =
        'Direct API calls are blocked by CORS. Use "Copy for Notion" and paste into your page instead.';
    } else {
      statusEl.textContent = `Error: ${err.message}`;
    }
  }
});

document.getElementById('close-reminder').addEventListener('click', () => {
  document.getElementById('notion-setup-reminder').classList.add('hidden');
});

// ---- Downloads ----
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById('download-markdown-button').addEventListener('click', () => {
  downloadFile(formatEntries(), 'journal.md', 'text/markdown');
});

document.getElementById('download-text-button').addEventListener('click', () => {
  downloadFile(formatEntries(), 'journal.txt', 'text/plain');
});

document.getElementById('download-enex-button').addEventListener('click', () => {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<en-export export-date="${new Date().toISOString()}" application="A Good Start">
  <note>
    <title>Journal Entry — ${getDateString()}</title>
    <content><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
      <en-note>${journalEntries.map(e =>
        `<div><b>${e.question}</b></div><div>${e.answer}</div><div><br/></div>`
      ).join('')}</en-note>
    ]]></content>
    <created>${new Date().toISOString()}</created>
  </note>
</en-export>`;
  downloadFile(content, 'journal.enex', 'application/xml');
});

document.getElementById('email-button').addEventListener('click', () => {
  const subject = encodeURIComponent(`Journal Entry — ${getDateString()}`);
  const body    = encodeURIComponent(formatEntries());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

// ---- Restart ----
document.getElementById('restart-button').addEventListener('click', () => {
  selectedApproach    = [];
  currentQuestionIndex = 0;
  journalEntries      = [];
  totalQuestions      = 0;
  document.querySelectorAll('input[name="approach"]').forEach(cb => cb.checked = false);
  document.getElementById('finish-container').classList.add('hidden');
  document.getElementById('instruction-page').classList.remove('hidden');
});
