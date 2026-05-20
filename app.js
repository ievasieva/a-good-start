let selectedApproach  = [];
let currentQuestionIndex = 0;
let journalEntries    = [];
let allApproaches     = {};
let totalQuestions    = 0;
let currentLang       = 'en';

// ---- Translations ----
const i18n = {
  en: {
    'eyebrow':                '— est. today —',
    'subtitle':               'no-bullshit daily journaling',
    'step1':                  'Choose a prompt set.',
    'step2':                  'Answer the questions.',
    'step3':                  "Save in your preferred way — this app doesn't store anything.",
    'step4':                  'Come back another day.',
    'accordion-title':        "What's in each prompt set?",
    'choose-practice':        'choose your practice',
    'approach-morningPages':  'Morning Pages',
    'approach-futureSelf':    'Future Self',
    'approach-morningProductivity': 'Morning Productivity',
    'approach-gratitude':     'Gratitude',
    'approach-affirmations':  'Affirmations',
    'btn-begin':              'Begin',
    'btn-skip':               'skip',
    'btn-continue':           'Continue',
    'btn-finish':             'Finish',
    'completion-eyebrow':     '— session complete —',
    'completion-title':       'You showed up.',
    'completion-subtitle':    "That's the whole practice.",
    'save-label':             'save your entry',
    'notion-desc':            'Copy your entry as Notion-ready markdown and paste it directly into any Notion page.',
    'btn-copy-notion':        'Copy for Notion',
    'notion-copied':          'Copied. Open Notion, create or enter a page, and press Ctrl+V / ⌘V to paste.',
    'btn-markdown':           'Markdown',
    'btn-text':               'Plain Text',
    'btn-evernote':           'Evernote',
    'btn-email':              'Email',
    'btn-restart':            'begin again ↺',
  },
  lv: {
    'eyebrow':                '— dibināts šodien —',
    'subtitle':               'ikdienas žurnālraksts bez muļķībām',
    'step1':                  'Izvēlies uzvedņu kopu.',
    'step2':                  'Atbildi uz jautājumiem.',
    'step3':                  'Saglabā tā, kā tev ērti — šī lietotne neko neglabā.',
    'step4':                  'Atgriezies citā dienā.',
    'accordion-title':        'Kas ir katrā uzvedņu kopā?',
    'choose-practice':        'izvēlies savu praksi',
    'approach-morningPages':  'Rīta lapas',
    'approach-futureSelf':    'Nākotnes es',
    'approach-morningProductivity': 'Rīta produktivitāte',
    'approach-gratitude':     'Pateicība',
    'approach-affirmations':  'Apliecinājumi',
    'btn-begin':              'Sākt',
    'btn-skip':               'izlaist',
    'btn-continue':           'Turpināt',
    'btn-finish':             'Pabeigt',
    'completion-eyebrow':     '— sesija pabeigta —',
    'completion-title':       'Tu atnāci.',
    'completion-subtitle':    'Tā ir visa prakse.',
    'save-label':             'saglabā savu ierakstu',
    'notion-desc':            'Nokopē ierakstu un ielīmē to jebkurā Notion lapā.',
    'btn-copy-notion':        'Kopēt Notion',
    'notion-copied':          'Nokopēts. Atver Notion, atver vai izveido lapu un nospied Ctrl+V / ⌘V, lai ielīmētu.',
    'btn-markdown':           'Markdown',
    'btn-text':               'Vienkāršs teksts',
    'btn-evernote':           'Evernote',
    'btn-email':              'E-pasts',
    'btn-restart':            'sākt no jauna ↺',
  }
};

// ---- Language ----
function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
  });

  document.querySelectorAll('[data-lang-show]').forEach(el => {
    el.classList.toggle('hidden', el.dataset.langShow !== lang);
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('preferred_lang', lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

// ---- Load questions ----
fetch('questions.json')
  .then(r => r.json())
  .then(data => {
    allApproaches = data;
    const saved = localStorage.getItem('preferred_lang') || 'en';
    applyLanguage(saved);
  })
  .catch(err => console.error('Error loading questions:', err));

// ---- Start ----
document.getElementById('start-button').addEventListener('click', () => {
  const checked = document.querySelectorAll('input[name="approach"]:checked');
  if (checked.length === 0) {
    document.getElementById('journal-form').classList.add('shake');
    setTimeout(() => document.getElementById('journal-form').classList.remove('shake'), 400);
    return;
  }

  const langData = allApproaches[currentLang] || allApproaches['en'];
  selectedApproach = [];
  checked.forEach(box => {
    selectedApproach = selectedApproach.concat(langData[box.value] || []);
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
  document.getElementById('next-btn-text').textContent =
    i18n[currentLang][isLast ? 'btn-finish' : 'btn-continue'];

  setTimeout(() => document.getElementById('answer').focus(), 100);
}

document.getElementById('next-button').addEventListener('click', () => {
  const answer = document.getElementById('answer').value;
  if (answer.trim() === '') {
    document.getElementById('answer').classList.add('shake');
    setTimeout(() => document.getElementById('answer').classList.remove('shake'), 400);
    return;
  }
  journalEntries.push({
    question: selectedApproach[currentQuestionIndex],
    answer:   answer.trim()
  });
  currentQuestionIndex++;
  displayNextQuestion();
});

document.getElementById('skip-button').addEventListener('click', () => {
  journalEntries.push({
    question: selectedApproach[currentQuestionIndex],
    answer:   '—'
  });
  currentQuestionIndex++;
  displayNextQuestion();
});

// ---- Date formatting ----
function getDateString() {
  const locale = currentLang === 'lv' ? 'lv-LV' : 'en-GB';
  return new Date().toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ---- Format for Notion / clipboard ----
// Bold date heading, italic questions, plain answers, --- dividers
function formatForNotion() {
  const date = getDateString();
  let out = `# **${date}**\n\n`;
  journalEntries.forEach(e => {
    out += `*${e.question}*\n\n${e.answer}\n\n---\n\n`;
  });
  return out.trimEnd();
}

// ---- Format for Markdown download ----
function formatMarkdown() {
  const date = getDateString();
  let out = `# **${date}**\n\n`;
  journalEntries.forEach(e => {
    out += `*${e.question}*\n\n${e.answer}\n\n---\n\n`;
  });
  return out.trimEnd();
}

// ---- Format for plain text download ----
function formatPlainText() {
  const date = getDateString();
  const bar  = '─'.repeat(40);
  let out = `${date.toUpperCase()}\n${bar}\n\n`;
  journalEntries.forEach((e, i) => {
    out += `${e.question}\n\n${e.answer}\n\n${bar}\n\n`;
  });
  return out.trimEnd();
}

// ---- Format for email ----
// Plain text only — mailto: body can't carry rich formatting
function formatEmail() {
  const date = getDateString();
  let out = `${date}\n${'─'.repeat(40)}\n\n`;
  journalEntries.forEach(e => {
    out += `${e.question}\n${e.answer}\n\n`;
  });
  return out.trimEnd();
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
  el.textContent = i18n[currentLang]['notion-copied'];
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 9000);
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
  downloadFile(formatMarkdown(), 'journal.md', 'text/markdown');
});

document.getElementById('download-text-button').addEventListener('click', () => {
  downloadFile(formatPlainText(), 'journal.txt', 'text/plain');
});

document.getElementById('download-enex-button').addEventListener('click', () => {
  const date    = getDateString();
  const entries = journalEntries.map(e =>
    `<div><b><i>${e.question}</i></b></div><div>${e.answer}</div><div><br/></div>`
  ).join('');
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<en-export export-date="${new Date().toISOString()}" application="A Good Start">
  <note>
    <title>${date}</title>
    <content><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
      <en-note><div><b>${date}</b></div><div><br/></div>${entries}</en-note>
    ]]></content>
    <created>${new Date().toISOString()}</created>
  </note>
</en-export>`;
  downloadFile(content, 'journal.enex', 'application/xml');
});

document.getElementById('email-button').addEventListener('click', () => {
  const date    = getDateString();
  const subject = encodeURIComponent(`Journal Entry — ${date}`);
  const body    = encodeURIComponent(formatEmail());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

// ---- Restart ----
document.getElementById('restart-button').addEventListener('click', () => {
  selectedApproach     = [];
  currentQuestionIndex = 0;
  journalEntries       = [];
  totalQuestions       = 0;
  document.querySelectorAll('input[name="approach"]').forEach(cb => cb.checked = false);
  document.getElementById('finish-container').classList.add('hidden');
  document.getElementById('instruction-page').classList.remove('hidden');
});
