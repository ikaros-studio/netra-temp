<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(true);

// Mock data
const totalCases = ref(445);
const totalCompanies = ref(295);
const totalIndividuals = ref(150);
const totalTrend = ref(22.1);
const companiesTrend = ref(42.1);
const individualsTrend = ref(12.1);

// Simulate loading
setTimeout(() => {
  isLoading.value = false;
}, 1500);
</script>

<template>
  <Card class="p-6 dark:bg-gray-800">
    <h2 class="text-2xl font-bold dark:text-white">Case Status Overview</h2>
    
    <div class="mt-4 flex items-center gap-2">
      <select class="rounded border p-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600">
        <option>1 month</option>
        <option>3 months</option>
        <option>6 months</option>
      </select>
      <select class="rounded border p-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600">
        <option>Individuals & companies</option>
        <option>Individuals</option>
        <option>Companies</option>
      </select>
    </div>
    
    <SaasLoadingSpinner v-if="isLoading" />
    
    <div v-else class="my-8 flex justify-between">
      <div>
        <div class="mb-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
          <div class="text-2xl font-semibold dark:text-white">{{ totalCases }}</div>
          <div class="text-xs text-green-500 dark:text-green-400">{{ totalTrend }}% ↑</div>
        </div>
        
        <div class="mb-4">
          <div class="text-sm text-gray-500 dark:text-gray-400">Companies</div>
          <div class="text-2xl font-semibold dark:text-white">{{ totalCompanies }}</div>
          <div class="text-xs text-green-500 dark:text-green-400">{{ companiesTrend }}% ↑</div>
        </div>
        
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Individuals</div>
          <div class="text-2xl font-semibold dark:text-white">{{ totalIndividuals }}</div>
          <div class="text-xs text-green-500 dark:text-green-400">{{ individualsTrend }}% ↑</div>
        </div>
      </div>
      
      <div class="flex items-center justify-center">
        <!-- Placeholder for pie chart -->
        <div class="h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl font-bold dark:text-white">{{ totalCases }}</div>
            <div class="text-xs dark:text-gray-300">Total</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-center">
      <button class="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">View More</button>
    </div>
  </Card>
</template> 