<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(true);

// Mock data
const reviews = ref([
  {
    name: 'ABC Corp Ltd.',
    type: 'Company',
    riskLevel: 'Medium',
    riskScore: 52,
    dueDate: 'Feb 27, 2025'
  },
  {
    name: 'Apex Ventures',
    type: 'Company',
    riskLevel: 'Medium',
    riskScore: 45,
    dueDate: 'Feb 27, 2025'
  },
  {
    name: 'Marcus Chen',
    type: 'Individual',
    riskLevel: 'High',
    riskScore: 68,
    dueDate: 'Mar 12, 2025'
  },
  {
    name: 'Priya Patel',
    type: 'Individual',
    riskLevel: 'High',
    riskScore: 66,
    dueDate: 'Mar 13, 2025'
  },
  {
    name: 'Prism Analytics',
    type: 'Company',
    riskLevel: 'High',
    riskScore: 86,
    dueDate: 'Feb 24, 2025'
  }
]);

// Simulate loading
setTimeout(() => {
  isLoading.value = false;
}, 2000);
</script>

<template>
  <Card class="p-6 dark:bg-gray-800">
    <h2 class="text-2xl font-bold dark:text-white">Upcoming Reviews</h2>
    
    <SaasLoadingSpinner v-if="isLoading" />
    
    <div v-else class="mt-6">
      <table class="min-w-full">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="p-2 text-left text-sm dark:text-gray-200">Customer Name</th>
            <th class="p-2 text-left text-sm dark:text-gray-200">Type</th>
            <th class="p-2 text-left text-sm dark:text-gray-200">Risk Level</th>
            <th class="p-2 text-left text-sm dark:text-gray-200">Due Date</th>
          </tr>
        </thead>
        <tbody class="dark:text-gray-200">
          <tr v-for="(review, index) in reviews" :key="index" class="dark:border-gray-700 dark:hover:bg-gray-700">
            <td class="p-2 text-sm font-medium dark:text-white">{{ review.name }}</td>
            <td class="p-2 text-sm dark:text-gray-300">{{ review.type }}</td>
            <td class="p-2">
              <span 
                class="rounded-full px-2 py-1 text-xs"
                :class="review.riskLevel === 'High' 
                  ? 'bg-red-300 dark:bg-red-800 dark:text-red-200' 
                  : 'bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200'"
              >
                {{ review.riskLevel }} ({{ review.riskScore }})
              </span>
            </td>
            <td class="p-2 text-sm dark:text-gray-300">{{ review.dueDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="mt-6 flex justify-center">
      <button class="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Review Now</button>
    </div>
  </Card>
</template> 