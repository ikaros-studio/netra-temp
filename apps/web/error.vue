<script setup lang="ts">
  import { UndoIcon } from "lucide-vue-next";
  
  const props = defineProps({
    error: Object
  });

  const handleError = () => {
    clearError({ redirect: '/' });
  };
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <h1 class="text-5xl font-bold">{{ error?.statusCode || '404' }}</h1>
    <p class="mt-2 text-xl">{{ error?.statusMessage || 'Page not found' }}</p>
    <p v-if="error?.message" class="mt-1 text-sm text-muted-foreground">{{ error.message }}</p>

    <div class="mt-6 flex gap-4">
      <Button variant="outline" @click="handleError">
        <UndoIcon class="mr-2 size-4" /> Try again
      </Button>

      <NuxtLink to="/">
        <Button>
          Go to homepage
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
