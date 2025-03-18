<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '~/modules/ui/components/card';

const props = defineProps<{
  entityId: string | number;
}>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Compliance Knowledge Graph</CardTitle>
    </CardHeader>
    <CardContent class="p-6">
      <div class="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p class="text-gray-500">Graph visualization for entity #{{ entityId }} would be displayed here</p>
      </div>
    </CardContent>
  </Card>
</template> 