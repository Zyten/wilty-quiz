<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto mb-8 group">
        <div class="bg-gradient-to-br from-white to-gray-50/90 p-5 rounded-md shadow-sm transform -rotate-1 hover:rotate-1 transition-all duration-700 border border-gray-100">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-[Indie_Flower] text-gray-700 text-center">
            Would I Lie To You?
          </h1>
        </div>
      </div>
      <QuizComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import QuizComponent from '@/components/QuizComponent.vue'
</script>
