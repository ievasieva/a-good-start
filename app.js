let selectedApproach = [];
let currentQuestionIndex = 0;
let journalEntries = [];
let approaches = {}; // Initialize as empty

// Fetch questions from the external JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    approaches = data;  // Load questions into the approaches object
  })
  .catch(error => console.error("Error loading questions:", error));

document.getElementById('start-button').addEventListener('click', () => {
  const checkedBoxes = document.querySelectorAll('input[name="approach"]:checked');
  if (checkedBoxes.length === 0) {
    alert("Please select at least one approach");
    return;
  }
  
  // Collect selected approaches
  checkedBoxes.forEach(box => {
    selectedApproach = selectedApproach.concat(approaches[box.value]);
  });

  // Hide the instruction page and show the question container
  document.getElementById('instruction-page').style.display = 'none';
  document.getElementById('question-container').style.display = 'block';
  
  displayNextQuestion();
});

function displayNextQuestion() {
  if (currentQuestionIndex >= selectedApproach.length) {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('finish-container').style.display = 'block';
    return;
  }

  document.getElementById('question').textContent = selectedApproach[currentQuestionIndex];
  document.getElementById('answer').value = '';
}

document.getElementById('next-button').addEventListener('click', () => {
  const answer = document.getElementById('answer').value;
  if (answer.trim() === '') {
    alert("Please provide an answer before moving on");
    return;
  }

  // Save the entry
  journalEntries.push({
    question: selectedApproach[currentQuestionIndex],
    answer: answer
  });

  currentQuestionIndex++;
  displayNextQuestion();
});

// Function to format entries for downloads
function formatEntries() {
  return journalEntries.map(entry => `## ${entry.question}\n${entry.answer}\n\n`).join('');
}

// Download as Markdown
document.getElementById('download-markdown-button').addEventListener('click', () => {
  const content = formatEntries();
  const blob = new Blob([content], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'journal.md'; // Name of the Markdown file
  link.click();
});

// Download as Text
document.getElementById('download-text-button').addEventListener('click', () => {
  const content = formatEntries();
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'journal.txt'; // Name of the Text file
  link.click();
});

// Download ENEX file as one note
document.getElementById('download-enex-button').addEventListener('click', () => {
  const enexHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<en-export export-date="' + new Date().toISOString() + '" application="A Good Start">\n';
  const enexFooter = '</en-export>';
  const enexNote = `
    <note>
      <title>Journal Entry</title>
      <content><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
        <en-note>${journalEntries.map(entry => `<div>## ${entry.question}</div><div>${entry.answer}</div><br>`).join('')}
        </en-note>
      ]]></content>
      <created>${new Date().toISOString()}</created>
    </note>
  `;
  const enexContent = enexHeader + enexNote + enexFooter;
  const blob = new Blob([enexContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'journal.enex'; // Name of the ENEX file
  link.click();
});

// Trigger email client with journal entries
document.getElementById('email-button').addEventListener('click', () => {
  const content = formatEntries();
  const subject = encodeURIComponent("Your Journal Entries");
  const body = encodeURIComponent(content);
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

  // Create a temporary link element to trigger the mail client
  const link = document.createElement('a');
  link.href = mailtoLink;
  link.click();
});
