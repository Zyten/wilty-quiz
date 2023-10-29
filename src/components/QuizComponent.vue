<template>
  <div>
    <div class="quiz">
      <div class="question-container mt-5">
        <div v-if="currentQuestion" class="quiz-question my-8">
          <h2 class="text-xl font-medium mb-4">{{ currentQuestion.title }}</h2>
          <div
            id="player-container"
            class="player-container mb-4 relative h-72 w-full pb-3/4"
          ></div>
          <div class="answer-buttons-container flex flex-wrap justify-center mb-4">
            <button
              v-for="option in currentQuestion.options"
              :key="option"
              :disabled="selectedAnswer"
              @click="selectAnswer(option, $event)"
              :class="[
                'btn text-white font-bold m-2 py-2 px-4 rounded',
                selectedAnswer === option ? (option === currentQuestion.correctOption ? 'bg-green-500' : 'bg-red-500') : 'bg-neutral-500',
                !selectedAnswer ? 'hover:bg-neutral-700' : ''
              ]"
            >
              {{ option }}
            </button>
          </div>
          <button
            v-if="selectedAnswer"
            @click="nextQuestion"
            :class="['btn-next', selectedAnswer ? '' : 'hidden', 'bg-blue-500 hover:bg-blue-700 text-white p-3 block w-full']"
            >
            Next
          </button>
        </div>
        <div v-else>
          <div class="text-center">
            <h2 class="text-xl font-medium mb-4">You got {{ score }} out of {{ quizLength }} questions correct!</h2>
            <a
              href=""
              class="bg-blue-500 hover:bg-blue-700 text-white p-3 block w-full"
            >
              Restart Quiz
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import quizData from '@/quizData.json'

const xRandomItems = (array, x) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, x);
};

const quizLength = ref(5)
const quizQuestions = ref(xRandomItems(quizData.questions, quizLength.value))
const currentQuestionIndex = ref(0)
const currentQuestion = ref(quizQuestions.value[currentQuestionIndex.value])
const selectedAnswer = ref(null)
const score = ref(0)



const selectAnswer = (option, event) => {
  selectedAnswer.value = option
  if (option === currentQuestion.value.correctOption) {
    score.value++
  }

  videoPlayer.playVideo()
}

const nextQuestion = () => {
  currentQuestionIndex.value++
  if (currentQuestionIndex.value < quizLength.value) {
    currentQuestion.value = quizQuestions.value[currentQuestionIndex.value]
    selectedAnswer.value = null
    if (videoPlayer) {
      videoPlayer.loadVideoById(currentQuestion.value.videoId);
    }
  } else {
    currentQuestion.value = null
  }
}

// Initialize YouTube player
let videoPlayer = null;
const pausePlayTimer = ref(null);

const pauseVideo = (player) => {
  player.pauseVideo();
};

onMounted(() => {
  videoPlayer = new YT.Player('player-container', {
    height: '100%',
    width: '100%',
    videoId: currentQuestion.value.videoId,
    playerVars: {
      origin: location.origin,
      autoplay: 1,
      controls: 1,
      disablekb: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: (event) => {
        event.target.playVideo();
      },
      onStateChange: (event) => {
        let time, rate, remainingTime;
        let player = event.target;
        clearTimeout(pausePlayTimer.value);
        if (event.data == YT.PlayerState.PLAYING) {
          time = player.getCurrentTime();
          let pausePlayAt = currentQuestion.value.revealTimestamp;
          if (time + 0.4 < pausePlayAt) {
            rate = player.getPlaybackRate();
            remainingTime = (pausePlayAt - time) / rate;
            pausePlayTimer.value = setTimeout(() => pauseVideo(player), remainingTime * 1000);
          } else if (selectedAnswer.value !== null) {
            player.playVideo();
          } else {
            player.seekTo(pausePlayAt);
            player.pauseVideo();
          }
        }
      },
    },
  });
});

</script>
