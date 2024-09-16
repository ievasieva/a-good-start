let selectedApproach = [];
let currentQuestionIndex = 0;
let journalEntries = [];
let approaches = {}; // Initialize as empty

// Fetch questions from the external JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    approaches = data;
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
