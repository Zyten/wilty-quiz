<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-center mb-8">Would I Lie To You?</h1>
      <QuizComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import QuizComponent from '@/components/QuizComponent.vue'
</script>
