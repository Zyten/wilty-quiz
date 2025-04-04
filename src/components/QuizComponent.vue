<template>
  <div>
    <div class="quiz">
      <!-- Loading State with Skeleton UI -->
      <div v-if="isLoading" class="animate-pulse">
        <div class="lg:grid lg:grid-cols-2 lg:gap-8">
          <div class="mb-6 lg:mb-0">
            <div class="bg-gray-200 aspect-video rounded-lg w-full"></div>
          </div>
          <div>
            <div class="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div class="space-y-4">
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="question-container">
        <div v-if="currentQuestion" class="lg:grid lg:grid-cols-2 lg:gap-8">
          <!-- Video Section -->
          <div class="video-section mb-8 lg:mb-0">
            <div class="bg-gray-900 rounded-lg p-2 shadow-lg">
              <div 
                id="player-container" 
                class="relative w-full aspect-video rounded overflow-hidden"
              ></div>
              <div class="mt-2 px-2">
                <div class="text-gray-400 text-sm">
                  {{ selectedAnswer ? 'Playing full clip...' : 'Video paused at reveal point' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Question and Answers Section -->
          <div class="quiz-content flex flex-col">
            <div class="mb-6 space-y-2">
              <h2 class="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                {{ currentQuestion.orator }}: "{{ currentQuestion.statement }}"
              </h2>
              <p class="text-sm text-gray-500">Select your answer to see the full clip</p>
            </div>

            <div class="answer-buttons-container flex-grow">
              <div class="grid grid-cols-1 gap-3 md:gap-4">
                <button
                  v-for="option in currentQuestion.options"
                  :key="option"
                  :disabled="selectedAnswer"
                  @click="selectAnswer(option, $event)"
                  :class="[
                    'w-full text-left px-6 py-4 rounded-lg font-medium transition-all duration-200',
                    'flex items-center',
                    selectedAnswer === option
                      ? option === currentQuestion.correctOption
                        ? 'bg-green-100 text-green-800 border-2 border-green-500 shadow-inner'
                        : 'bg-red-100 text-red-800 border-2 border-red-500 shadow-inner'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md',
                    !selectedAnswer ? 'cursor-pointer' : 'cursor-default'
                  ]"
                >
                  {{ option }}
                </button>
              </div>
            </div>

            <div class="mt-6 sm:mt-8">
              <button
                v-if="selectedAnswer"
                @click="nextQuestion"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                Next Question
              </button>
            </div>
          </div>
        </div>

        <!-- Quiz Complete Screen -->
        <div v-else class="text-center py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold mb-6 text-gray-800">
            Quiz Complete!
          </h2>
          <p class="text-xl mb-8 text-gray-600">
            You got {{ score }} out of {{ quizLength }} questions correct!
          </p>
          <a 
            href="" 
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { version } from '../../package.json'

const appVersion = version
console.info('Wilty Quiz v' + version)

const gSheetId = import.meta.env.VITE_GSHEET_ID
//const cloudflareWorkerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL
//For some reason, this doesn't get pulled from Github Secrets so hardcoding for now
const cloudflareWorkerUrl = 'https://wilty-quiz.sruban707.workers.dev'
console.log('Source: https://docs.google.com/spreadsheets/d/' + gSheetId)
console.log('Loaded via: ' + cloudflareWorkerUrl)

const isLoading = ref(true)
const quizData = ref({
  questions: []
})

async function loadQuizData() {
  const oneday = 60 * 60 * 24 * 1000
  const cacheKey = 'wilty-quiz-data'
  const cachedData = JSON.parse(localStorage.getItem(cacheKey))
  const cacheValid =
    cachedData && cachedData.version === appVersion && Date.now() - cachedData.timestamp < oneday

  if (cacheValid) {
    console.warn('Loading from cache')
    console.info('Next update on ' + new Date(oneday + cachedData.timestamp) + ')')
    quizData.value.questions = cachedData.questions
  } else {
    try {
      const response = await fetch(cloudflareWorkerUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error calling Cloudflare Worker: ${response.statusText}`)
      }

      // Check if the response is JSON
      const contentType = response.headers.get('Content-Type')
      if (!contentType || !contentType.includes('application/json')) {
        // Read the response as text and log it
        const textResponse = await response.text()
        console.error('Unexpected response:', textResponse)
        throw new Error('Invalid content type, expected JSON')
      }

      quizData.value.questions = await response.json()

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          version: appVersion,
          questions: quizData.value.questions
        })
      )
    } catch (error) {
      console.error('Failed to load quiz data:', error)
    }
  }

  quizQuestions.value = xRandomItems(quizData.value.questions, quizLength.value)
  currentQuestion.value = quizQuestions.value[currentQuestionIndex.value]
  isLoading.value = false
}

const xRandomItems = (array, x) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.slice(0, x)
}

const quizLength = ref(5)
const quizQuestions = ref()
const currentQuestionIndex = ref(0)
const currentQuestion = ref()
const selectedAnswer = ref(null)
const score = ref(0)

const selectAnswer = (option) => {
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
      videoPlayer.loadVideoById(currentQuestion.value.videoId)
    }
  } else {
    currentQuestion.value = null
  }
}

// Initialize YouTube player
let videoPlayer = null
const pausePlayTimer = ref(null)

const pauseVideo = (player) => {
  player.pauseVideo()
}

onMounted(() => {
  loadQuizData().then(() => {
    window.YT.ready(function () {
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
          rel: 0
        },
        events: {
          onReady: (event) => {
            event.target.playVideo()
          },
          onStateChange: (event) => {
            let time, rate, remainingTime
            let player = event.target
            clearTimeout(pausePlayTimer.value)
            if (event.data == YT.PlayerState.PLAYING) {
              time = player.getCurrentTime()
              let pausePlayAt = currentQuestion.value.revealTimestamp
              if (time + 0.4 < pausePlayAt) {
                rate = player.getPlaybackRate()
                remainingTime = (pausePlayAt - time) / rate
                pausePlayTimer.value = setTimeout(() => pauseVideo(player), remainingTime * 1000)
              } else if (selectedAnswer.value !== null) {
                player.playVideo()
              } else {
                player.seekTo(pausePlayAt)
                player.pauseVideo()
              }
            }
          }
        }
      })
    })
  })
})
</script>
