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

  // Hide the form and show the first question
  document.getElementById('journal-form').style.display = 'none';
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

// Download as Markdown
document.getElementById('download-button').addEventListener('click', () => {
  const content = journalEntries.map(entry => `### Q: ${entry.question}\n**A:** ${entry.answer}\n\n`).join('');
  const blob = new Blob([content], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'journal.md'; // Name of the Markdown file
  link.click();
});

// Function to generate ENEX content
function generateEnexContent() {
  const enexHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<en-export export-date="' + new Date().toISOString() + '" application="A Good Start">\n';
  const enexFooter = '</en-export>';
  
  const enexNotes = journalEntries.map(entry => `
    <note>
      <title>Journal Entry</title>
      <content><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
        <en-note>
          <div><b>Q:</b> ${entry.question}</div>
          <div><b>A:</b> ${entry.answer}</div>
        </en-note>
      ]]></content>
      <created>${new Date().toISOString()}</created>
    </note>
  `).join('');

  return enexHeader + enexNotes + enexFooter;
}

// Download ENEX file
document.getElementById('download-enex-button').addEventListener('click', () => {
  const enexContent = generateEnexContent();
  const blob = new Blob([enexContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'journal.enex'; // Name of the ENEX file
  link.click();
});


// Trigger email client with journal entries
document.getElementById('email-button').addEventListener('click', () => {
  const content = journalEntries.map(entry => `Q: ${entry.question}\nA: ${entry.answer}\n\n`).join('');
  const subject = encodeURIComponent("Your Journal Entries");
  const body = encodeURIComponent(content);
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

  // Create a temporary link element to trigger the mail client
  const link = document.createElement('a');
  link.href = mailtoLink;
  link.click();
});
