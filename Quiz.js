// Component for displaying a quiz question
class QuizQuestion {
  constructor(questionData, onAnswerSelected) {
    this.questionData = questionData;
    this.onAnswerSelected = onAnswerSelected;
    this.element = this.createQuestionElement();
    this.videoPlayer = null;
    this.selectedAnswer = null;
  }

  createQuestionElement() {
    const container = document.createElement("div");
    container.classList.add("quiz-question");

    const title = document.createElement("h2");
    title.innerText = this.questionData.title;
    container.appendChild(title);

    const playerContainer = document.createElement("div");
    playerContainer.classList.add("player-container");
    container.appendChild(playerContainer);

    const answerButtons = document.createElement("div");
    answerButtons.classList.add("answer-buttons");
    container.appendChild(answerButtons);

    this.questionData.options.forEach((option) => {
      const button = document.createElement("button");
      button.innerText = option;
      button.classList.add("btn");
      button.addEventListener("click", () => {
        if (this.selectedAnswer === null) {
          this.selectedAnswer = option;
          button.classList.add("selected");
          this.onAnswerSelected(option === this.questionData.correctOption);
        }
      });
      answerButtons.appendChild(button);
    });

    // Initialize the YouTube video player
    this.videoPlayer = new YT.Player(playerContainer, {
      height: "360",
      width: "640",
      videoId: this.questionData.videoId,
      playerVars: {
        origin: "http://127.0.0.1:5500",
        autoplay: 1,
        controls: 0,
        disablekb: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        end: this.questionData.revealTimestamp,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
        },
        onStateChange: (event) => {
          // When the video finishes, remove the question element
          //   if (event.data === YT.PlayerState.ENDED) {
          //     container.remove();
          //   }
        },
      },
    });

    return container;
  }
}

// Component for managing the quiz and displaying the questions
class Quiz {
  constructor(quizData) {
    this.quizData = quizData;
    this.currentIndex = 0;
    this.element = this.createQuizElement();
  }

  createQuizElement() {
    const container = document.createElement("div");
    container.classList.add("quiz");

    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.addEventListener("click", () => {
      this.currentIndex++;
      if (this.currentIndex >= this.quizData.length) {
        this.onQuizFinished();
      } else {
        this.showQuestion();
      }
    });
    container.appendChild(nextButton);

    // Add a container for the question element
    const questionContainer = document.createElement("div");
    questionContainer.classList.add("question-container");
    container.appendChild(questionContainer);

    return container;
  }

  showQuestion() {
    const questionData = this.quizData[this.currentIndex];
    const question = new QuizQuestion(
      questionData,
      this.onAnswerSelected.bind(this),
      this.onQuestionFinished.bind(this)
    );

    // Replace the contents of the question container with the new question element
    const questionContainer = this.element.querySelector(".question-container");
    questionContainer.innerHTML = "";
    questionContainer.appendChild(question.element);
  }

  onAnswerSelected(isCorrect) {
    // Set isCorrect for the current question
    this.quizData[this.currentIndex].isCorrect = isCorrect;

    // Disable answer buttons
    const questionElement = this.element.querySelector(".quiz-question");
    const answerButtons = questionElement.querySelectorAll(
      ".answer-buttons button"
    );
    answerButtons.forEach((button) => (button.disabled = true));

    // Show feedback
    const feedback = document.createElement("p");
    feedback.innerText = isCorrect ? "Correct!" : "Incorrect";
    feedback.classList.add("feedback");
    questionElement.appendChild(feedback);

    // Show the next button
    const nextButton = this.element.querySelector("button");
    nextButton.classList.remove("hidden");

    // Play the reveal animation after a short delay
    setTimeout(() => {
      questionElement.classList.add(isCorrect ? "correct" : "incorrect");
    }, 500);
  }

  onQuestionFinished() {
    // Remove the current question element
    const questionElement = this.element.querySelector(".quiz-question");
    questionElement.remove();

    // Display the next question (or finish the quiz if there are no more questions)
    this.currentIndex++;
    if (this.currentIndex >= this.quizData.length) {
      this.onQuizFinished();
    } else {
      this.showQuestion();
    }
  }

  onQuizFinished() {
    const score = this.quizData.filter((question) => question.isCorrect).length;
    const message = `You got ${score} out of ${this.quizData.length} questions correct!`;
    alert(message);

    // Remove the quiz element from the page
    this.element.remove();
  }
}
