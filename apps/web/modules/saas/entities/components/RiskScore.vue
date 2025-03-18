<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/modules/ui/components/card';

const props = defineProps<{
  riskDetails: {
    score: number | null;
    pepPercentage: string;
    sanctionsPercentage: string;
    adverseMediaPercentage: string;
    status: string;
  }
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Risk Score</CardTitle>
      <CardDescription v-if="!riskDetails.score">
        The risk score will be calculated and displayed here once the compliance check begins.
      </CardDescription>
    </CardHeader>
    <CardContent class="p-6">
      <div class="flex flex-col items-center justify-center">
        <div class="relative h-40 w-40 mb-4">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <p class="text-4xl font-bold">{{ riskDetails.score ?? 'NA' }}</p>
              <p class="text-sm text-gray-500">{{ riskDetails.status }}</p>
            </div>
          </div>
          <svg class="h-40 w-40" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="10" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#9ca3af" stroke-width="10" stroke-dasharray="282.7" stroke-dashoffset="282.7" />
          </svg>
        </div>
        <div class="flex w-full justify-between text-sm text-gray-500">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mt-8">
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="text-lg font-semibold text-center">-{{ riskDetails.pepPercentage }}</p>
          <p class="text-gray-500 text-center">PEP</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="text-lg font-semibold text-center">-{{ riskDetails.sanctionsPercentage }}</p>
          <p class="text-gray-500 text-center">Sanctions</p>
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="text-lg font-semibold text-center">-{{ riskDetails.adverseMediaPercentage }}</p>
          <p class="text-gray-500 text-center">Adverse Media</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 