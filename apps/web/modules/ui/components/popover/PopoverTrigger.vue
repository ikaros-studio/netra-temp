<script setup lang="ts">
import { PopoverTrigger, type PopoverTriggerProps } from 'radix-vue'

// Define props with asChild defaulting to false - forcing the parent to explicitly set it
const props = withDefaults(defineProps<PopoverTriggerProps>(), {
  asChild: false
})
</script>

<template>
  <PopoverTrigger v-bind="props">
    <slot />
  </PopoverTrigger>
</template> 