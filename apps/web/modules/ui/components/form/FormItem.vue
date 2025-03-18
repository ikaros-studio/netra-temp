<script lang="ts">
  /* eslint-disable import/first */
  import type { HTMLAttributes, InjectionKey } from "vue";

  // eslint-disable-next-line symbol-description
  export const FORM_ITEM_INJECTION_KEY = Symbol() as InjectionKey<string>;
</script>

<script lang="ts" setup>
  import { provide } from "vue";
  import { useId } from "radix-vue";

  const props = defineProps<{
    class?: HTMLAttributes["class"];
  }>();

  // Generate a safe ID that works in both client and server
  const id = process.client 
    ? useId() 
    : `form-item-${Math.random().toString(36).substring(2, 9)}`;
    
  provide(FORM_ITEM_INJECTION_KEY, id);
</script>

<template>
  <div :class="cn('space-y-1', props.class)">
    <slot />
  </div>
</template>
