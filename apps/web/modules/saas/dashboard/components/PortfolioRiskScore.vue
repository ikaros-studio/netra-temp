<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(true);

// Mock data
const riskScore = ref(43);
const lowRiskNumbers = ref([134, 99]);
const mediumRiskNumbers = ref([10, 75]);
const highRiskNumbers = ref([60, 28]);

// Simulate loading
setTimeout(() => {
  isLoading.value = false;
}, 1800);
</script>

<template>
  <Card class="p-6 dark:bg-gray-800">
    <h2 class="text-2xl font-bold dark:text-white">Portfolio Risk Score</h2>
    
    <SaasLoadingSpinner v-if="isLoading" />
    
    <template v-else>
      <div class="mt-8 flex justify-center">
        <!-- Placeholder for gauge chart -->
        <div class="relative h-40 w-40 rounded-full border-8 border-yellow-200 dark:border-yellow-700">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl font-bold text-yellow-400 dark:text-yellow-300">{{ riskScore }}</div>
              <div class="text-sm text-yellow-400 dark:text-yellow-300">Medium Risk</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8">
        <h3 class="mb-4 text-xl font-semibold dark:text-white">Portfolio Risk Distribution</h3>
        <div class="flex justify-between gap-2">
          <div class="text-center">
            <div class="h-24 w-12 bg-green-400 dark:bg-green-600 mx-auto"></div>
            <div class="mt-2 text-sm dark:text-gray-300">Low Risk</div>
            <div class="flex gap-1 justify-center">
              <div class="text-sm font-semibold dark:text-white">{{ lowRiskNumbers[0] }}</div>
              <div class="text-sm font-semibold dark:text-white">{{ lowRiskNumbers[1] }}</div>
            </div>
          </div>
          <div class="text-center">
            <div class="h-16 w-12 bg-yellow-300 dark:bg-yellow-500 mx-auto"></div>
            <div class="mt-2 text-sm dark:text-gray-300">Medium Risk</div>
            <div class="flex gap-1 justify-center">
              <div class="text-sm font-semibold dark:text-white">{{ mediumRiskNumbers[0] }}</div>
              <div class="text-sm font-semibold dark:text-white">{{ mediumRiskNumbers[1] }}</div>
            </div>
          </div>
          <div class="text-center">
            <div class="h-12 w-12 bg-red-400 dark:bg-red-600 mx-auto"></div>
            <div class="mt-2 text-sm dark:text-gray-300">High Risk</div>
            <div class="flex gap-1 justify-center">
              <div class="text-sm font-semibold dark:text-white">{{ highRiskNumbers[0] }}</div>
              <div class="text-sm font-semibold dark:text-white">{{ highRiskNumbers[1] }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8 flex justify-center">
        <button class="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">View high-risk entities</button>
      </div>
    </template>
  </Card>
</template> 