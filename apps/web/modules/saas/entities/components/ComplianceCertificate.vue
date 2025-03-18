<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '~/modules/ui/components/card';

const props = defineProps<{
  entityId: string | number;
  entityName?: string;
  complianceChecks: Array<{
    type: string;
    status: 'Verified' | 'Pending' | 'Failed';
    source: string;
  }>;
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Compliance Certificate</CardTitle>
    </CardHeader>
    <CardContent class="p-6">
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-4">{{ entityName || 'Entity' }} ({{ entityId }})</h3>
        
        <div class="grid grid-cols-3 gap-4 border-b pb-4 mb-4 font-medium">
          <div>Checks</div>
          <div>Status</div>
          <div>From Trust Partners</div>
        </div>
        
        <div v-for="(check, index) in complianceChecks" :key="index" class="grid grid-cols-3 gap-4 py-4 border-b">
          <div>{{ check.type }}</div>
          <div>
            <span 
              class="px-3 py-1 rounded-full text-sm" 
              :class="{
                'bg-green-100 text-green-800': check.status === 'Verified',
                'bg-yellow-100 text-yellow-800': check.status === 'Pending',
                'bg-red-100 text-red-800': check.status === 'Failed'
              }"
            >
              {{ check.status }}
            </span>
          </div>
          <div class="text-gray-500">{{ check.source }}</div>
        </div>
      </div>
      
      <div class="flex justify-between mt-8">
        <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Review the case
        </button>
        <button class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Download report
        </button>
      </div>
    </CardContent>
  </Card>
</template> 