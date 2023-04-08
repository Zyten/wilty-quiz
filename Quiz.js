// Component for displaying a quiz question
class QuizQuestion {
  constructor(questionData, onAnswerSelected, onQuestionFinished) {
    this.questionData = questionData;
    this.onAnswerSelected = onAnswerSelected;
    this.onQuestionFinished = onQuestionFinished;
    this.element = this.createQuestionElement();
    this.videoPlayer = null;
    this.selectedAnswer = null;
  }

  createQuestionElement() {
    const container = document.createElement("div");
    container.classList.add("quiz-question", "my-8");

    const title = document.createElement("h2");
    title.innerText = this.questionData.title;
    title.classList.add("text-xl", "font-medium", "mb-4");
    container.appendChild(title);

    const playerContainer = document.createElement("div");
    playerContainer.classList.add(
      "player-container",
      "mb-4",
      "relative",
      "h-72",
      "w-full",
      "pb-3/4"
    );
    container.appendChild(playerContainer);

    const answerButtonsContainer = document.createElement("div");
    answerButtonsContainer.classList.add(
      "answer-buttons-container",
      "flex",
      "flex-wrap",
      "justify-center",
      "mb-4"
    );
    container.appendChild(answerButtonsContainer);

    const answerButtons = document.createElement("div");
    answerButtons.classList.add(
      "answer-buttons",
      "flex",
      "flex-wrap",
      "justify-center"
    );
    answerButtonsContainer.appendChild(answerButtons);

    this.questionData.options.forEach((option) => {
      const button = document.createElement("button");
      button.innerText = option;
      button.classList.add(
        "btn",
        "bg-neutral-500",
        "hover:bg-neutral-700",
        "text-white",
        "font-bold",
        "m-2",
        "py-2",
        "px-4",
        "rounded"
      );
      button.addEventListener("click", () => {
        if (this.selectedAnswer === null) {
          this.selectedAnswer = option;
          event.target.classList.add("selected");
          if (option === this.questionData.correctOption) {
            event.target.classList.add("bg-green-500");
          } else {
            event.target.classList.add("bg-red-500");
          }
          this.onAnswerSelected(option === this.questionData.correctOption);

          document
            .querySelectorAll(".answer-buttons > button")
            .forEach((btn) => btn.classList.remove("hover:bg-neutral-700"));
        }
      });
      answerButtons.appendChild(button);
    });

    // Add the Next button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.classList.add(
      "btn-next",
      "hidden",
      "bg-blue-500",
      "hover:bg-blue-700",
      "text-white",
      "p-3",
      "block",
      "w-full"
    );
    nextButton.addEventListener("click", () => {
      this.onQuestionFinished();
    });
    container.appendChild(nextButton);

    // Initialize the YouTube video player
    this.videoPlayer = new YT.Player(playerContainer, {
      height: "100%",
      width: "100%",
      videoId: this.questionData.videoId,
      playerVars: {
        origin: location.origin,
        autoplay: 1,
        controls: 1,
        disablekb: 1,
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

    // Add a container for the question element
    const questionContainer = document.createElement("div");
    questionContainer.classList.add("question-container", "mt-5");
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

    // Show the next button
    const nextButton = this.element.querySelector(".btn-next");
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
    document.getElementById("quiz-results").classList.remove("hidden");
  }
}
