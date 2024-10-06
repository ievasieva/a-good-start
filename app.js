<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Good Start - Journal App</title>
  <!-- Tailwind CSS -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    .collapse-content {
      display: none;
    }
    .active .collapse-content {
      display: block;
    }
    .arrow::before {
      content: "▶ ";
    }
    .active .arrow::before {
      content: "▼ ";
    }
    textarea {
      height: 200px;
      resize: vertical;
    }
  </style>
</head>
<body class="bg-gray-100 text-center">

  <!-- Title and subtitle -->
  <h1 class="text-5xl font-bold mt-8">A good start</h1>
  <p class="text-2xl mt-4 mb-8">Your daily journaling helper</p>

  <!-- How it works section -->
  <h2 class="text-3xl font-semibold">How does it work?</h2>
  <p class="text-lg mt-4 mb-8">Each set of prompts offered below consists of 2 to 5 questions. Choose what you feel like. Enter text in the boxes. Send a summary to your email, or to your notes, or download in the format you want.</p>

  <!-- Collapse box for more information -->
  <div class="border border-gray-300 bg-white rounded-lg p-4 mx-4">
    <button id="collapse-button" class="text-xl font-medium arrow focus:outline-none">Find out more about the different prompts</button>
    <div id="collapse-content" class="collapse-content mt-4 text-left text-lg">
      <p><strong>Morning Pages:</strong> Helps you reflect on how you feel about the day ahead and what you're looking forward to.</p>
      <p class="mt-2"><strong>Future Self:</strong> Prompts to reflect on the person you are becoming and how you can achieve your goals.</p>
      <p class="mt-2"><strong>Morning Productivity:</strong> Focuses on prioritizing your day, setting goals, and identifying barriers to productivity.</p>
      <p class="mt-2"><strong>Gratitude:</strong> Encourages you to reflect on what you're grateful for today.</p>
      <p class="mt-2"><strong>Manifestation:</strong> Helps you set clear intentions for achieving your goals and dreams.</p>
    </div>
  </div>

  <!-- Form for journaling approach selection -->
  <form id="journal-form" class="mt-6 space-y-4 mx-4">
    <div class="form-control space-y-4">
      <label class="cursor-pointer flex items-center justify-start space-x-4">
        <input type="checkbox" name="approach" value="morningPages" class="form-checkbox h-5 w-5 text-blue-600">
        <span class="text-lg">Morning Pages</span>
      </label>
      <label class="cursor-pointer flex items-center justify-start space-x-4">
        <input type="checkbox" name="approach" value="futureSelf" class="form-checkbox h-5 w-5 text-blue-600">
        <span class="text-lg">Future Self</span>
      </label>
      <label class="cursor-pointer flex items-center justify-start space-x-4">
        <input type="checkbox" name="approach" value="morningProductivity" class="form-checkbox h-5 w-5 text-blue-600">
        <span class="text-lg">Morning Productivity</span>
      </label>
      <label class="cursor-pointer flex items-center justify-start space-x-4">
        <input type="checkbox" name="approach" value="gratitude" class="form-checkbox h-5 w-5 text-blue-600">
        <span class="text-lg">Gratitude</span>
      </label>
      <label class="cursor-pointer flex items-center justify-start space-x-4">
        <input type="checkbox" name="approach" value="manifestation" class="form-checkbox h-5 w-5 text-blue-600">
        <span class="text-lg">Manifestation</span>
      </label>
    </div>
    <button type="button" id="start-button" class="bg-blue-600 text-white py-2 px-4 rounded mt-6 hover:bg-blue-700">Start Journaling</button>
  </form>

  <!-- Question and answer container -->
  <div id="question-container" style="display: none;" class="mt-6 space-y-4 mx-4">
    <p id="question" class="text-xl font-semibold"></p>
    <textarea id="answer" class="textarea w-full p-2 border rounded-md" placeholder="Write your answer here..."></textarea>
    <button id="next-button" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Next</button>
  </div>

  <!-- Completion page -->
  <div id="finish-container" style="display: none;" class="mt-6 space-y-4 mx-4">
    <h2 class="text-3xl font-bold">You're Done!</h2>
    <button id="download-markdown-button" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Download as Markdown</button>
    <button id="download-enex-button" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Download as ENEX</button>
    <button id="download-text-button" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Download as Text</button>
    <button id="email-button" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Send to Email</button>
  </div>

  <script>
    // Toggle collapse box functionality
    document.getElementById('collapse-button').addEventListener('click', function() {
      this.classList.toggle('active');
      document.getElementById('collapse-content').classList.toggle('active');
    });

    // Data to simulate journaling questions (you can replace this with dynamic data)
    const questions = {
      morningPages: ["How do you feel about the day ahead?", "What are you looking forward to?"],
      futureSelf: ["What behavior are you currently working on?", "What are your daily affirmations?"],
      morningProductivity: ["What's one action you can take today?", "What's the most important thing you must do?"],
      gratitude: ["What are you grateful for today?"],
      manifestation: ["By when will you achieve your goal?", "How will you get there?"]
    };

    let selectedQuestions = [];
    let currentQuestionIndex = 0;

    // Handling "Start Journaling" button functionality
    document.getElementById('start-button').addEventListener('click', function() {
      const selectedBoxes = document.querySelectorAll('input[name="approach"]:checked');
      if (selectedBoxes.length === 0) {
        alert("Please select at least one approach to start journaling.");
        return;
      }

      // Hide the form and show the question container
      document.getElementById('journal-form').style.display = 'none';
      document.getElementById('question-container').style.display = 'block';

      // Collect questions based on selected checkboxes
      selectedQuestions = [];
      selectedBoxes.forEach(box => {
        selectedQuestions = selectedQuestions.concat(questions[box.value]);
      });

      // Set the first question
      displayQuestion();
    });

    // Display the current question
    function displayQuestion() {
      if (currentQuestionIndex < selectedQuestions.length) {
        document.getElementById('question').textContent = selectedQuestions[currentQuestionIndex];
        document.getElementById('answer').value = ''; // Clear the previous answer
      } else {
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('finish-container').style.display = 'block';
      }
    }

    // Handling "Next" button to show next question
    document.getElementById('next-button').addEventListener('click', function() {
      const answer = document.getElementById('answer').value;
      if (answer.trim() === '') {
        alert("Please provide an answer before proceeding.");
        return;
      }

      // Store the answer (you could save it or send it later)
      // Move to the next question
      currentQuestionIndex++;
      displayQuestion();
    });
  </script>

</body>
</html>
