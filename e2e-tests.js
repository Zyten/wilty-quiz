const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000'); // Replace with the URL where your app is running

  // Initialize variables to keep track of the score
  let score = 0;

  // Function to test individual questions
  const testQuestion = async () => {
    // Check if question is displayed
    const questionText = await page.textContent('.quiz-question h2');
    if (!questionText) {
      console.log('Test failed: Quiz question is not displayed.');
      return;
    }

    // Check if answer options are displayed and click a random one
    const answerButtons = await page.$$('.answer-buttons button');
    if (answerButtons.length === 0) {
      console.log('Test failed: Answer options are not displayed.');
      return;
    }

    // Click a random answer and check if it's correct
    const randomIndex = Math.floor(Math.random() * answerButtons.length);
    const selectedButton = answerButtons[randomIndex];
    await selectedButton.click();

    // Check if the "Next" button appears
    await page.waitForSelector('.btn-next');
    const nextButton = await page.$('.btn-next');
    if (!nextButton) {
      console.log('Test failed: "Next" button does not appear.');
      return;
    }

    // Check if the selected answer is correct (based on the presence of 'bg-green-500' class)
    const isCorrect = await page.evaluate((button) => {
      return button.classList.contains('bg-green-500');
    }, selectedButton);

    if (isCorrect) {
      score++;
    }

    // Click the "Next" button to proceed to the next question
    await nextButton.click();
  };

  // Test: Quiz title is displayed
  const quizTitle = await page.textContent('h1');
  if (quizTitle !== 'Would I Lie To You?') {
    console.log('Test failed: Quiz title is not displayed correctly.');
  }

  // Test 5 questions (or however many questions your quiz has)
  for (let i = 0; i < 5; i++) {
    await testQuestion();
  }

  // Test: Quiz finishes and shows results
  const quizResults = await page.$('#quiz-results');
  if (!quizResults) {
    console.log('Test failed: Quiz does not finish or show results.');
  } else {
    console.log(`Test passed: Quiz finishes and shows results. Score: ${score}/5`);
  }

  // Test: "Restart Quiz" button appears and works
  const restartButton = await page.$('#btn-restart');
  if (!restartButton) {
    console.log('Test failed: "Restart Quiz" button does not appear.');
  } else {
    console.log('Test passed: "Restart Quiz" button appears.');
    await restartButton.click();

    // Validate that the quiz restarts (e.g., first question is displayed again)
    const firstQuestionAfterRestart = await page.textContent('.quiz-question h2');
    if (!firstQuestionAfterRestart) {
      console.log('Test failed: Quiz does not restart correctly.');
    } else {
      console.log('Test passed: Quiz restarts correctly.');
    }
  }

  await browser.close();
})();
