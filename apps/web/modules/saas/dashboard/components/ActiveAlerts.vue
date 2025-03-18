<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(true);

// Mock data
const alerts = ref([
  {
    type: 'Adverse Media',
    entity: 'Orion Tech Ltd.',
    date: 'Feb 20, 2025',
    description: 'linked the company to a fraud investigation.',
    severity: 'medium'
  },
  {
    type: 'Sanctions Alert',
    entity: 'Zen Finance Group',
    date: 'Feb 22, 2025',
    description: 'The company is identified as linked to a sanctioned entity.',
    severity: 'high'
  },
  {
    type: 'Adverse Media',
    entity: 'NovaCorp Holdings',
    date: 'Feb 22, 2025',
    description: 'Reports indicate alleged involvement in a major money laundering scheme.',
    severity: 'medium'
  }
]);

// Simulate loading
setTimeout(() => {
  isLoading.value = false;
}, 2200);
</script>

<template>
  <Card class="p-6 dark:bg-gray-800">
    <h2 class="text-2xl font-bold dark:text-white">Active Alerts</h2>
    
    <SaasLoadingSpinner v-if="isLoading" />
    
    <div v-else class="mt-6 space-y-4">
      <div v-for="(alert, index) in alerts" :key="index" class="rounded-md border p-4 dark:border-gray-700">
        <div class="flex items-start gap-3">
          <div 
            class="rounded-full p-2 text-center"
            :class="alert.severity === 'high' 
              ? 'bg-red-200 text-red-600 dark:bg-red-900 dark:text-red-300' 
              : 'bg-yellow-200 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'"
          >!</div>
          <div class="flex-1">
            <div class="font-medium dark:text-white">{{ alert.type }} - {{ alert.entity }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              was flagged on {{ alert.date }}. {{ alert.description }}
            </div>
          </div>
          <button class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View</button>
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-center">
      <button class="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">See all alerts</button>
    </div>
  </Card>
</template> 