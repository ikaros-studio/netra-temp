<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/modules/ui/components/card';

const props = defineProps<{
  entity: {
    id: any;
    name: string;
    type: string;
    caseStatus: string;
    registration: string;
    riskLevel: string;
    lastUpdate: string;
    dueDate: string;
    ein?: string;
    incorporationDate?: string;
    jurisdiction?: string;
    riskDetails?: {
      score: number | null;
      pepPercentage: string;
      sanctionsPercentage: string;
      adverseMediaPercentage: string;
      status: string;
    }
  }
}>();
</script>

<template>
  <div>
    <!-- Entity Overview -->
    <Card class="mb-8">
      <CardContent class="p-6">
        <div class="flex flex-col md:flex-row gap-8">
          <div class="flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-6 h-32 w-32">
            <h2 class="text-4xl font-bold">{{ entity.name.substring(0, 1) }}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            <div>
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400">{{ entity.type }}</p>
              </div>
              <div v-if="entity.ein" class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400">{{ entity.ein }}</p>
              </div>
            </div>
            <div>
              <div v-if="entity.incorporationDate" class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400">{{ entity.incorporationDate }}</p>
              </div>
              <div v-if="entity.jurisdiction" class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400">{{ entity.jurisdiction }}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 