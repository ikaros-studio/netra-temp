<script setup lang="ts">
import { type HTMLAttributes, computed, nextTick, ref } from 'vue'
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  useForwardPropsEmits,
} from 'radix-vue'
import { cn } from '@/modules/ui/lib/utils'

defineOptions({
  inheritAttrs: false,
})

// Only render portal on client side
const isClient = ref(false)
onMounted(() => {
  isClient.value = true
})

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(), {
  sideOffset: 4,
})
const emits = defineEmits<PopoverContentEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <PopoverPortal v-if="isClient">
    <PopoverContent
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn('z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', props.class)"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
  <!-- Fallback for SSR - nothing rendered during server-side rendering -->
</template> 