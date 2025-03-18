<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      withLabel?: boolean;
    }>(),
    {
      withLabel: true,
    },
  );
</script>

<template>
  <span class="flex items-center gap-2 font-semibold leading-none text-primary">
    <NuxtImg
      src="/icon.png"
      alt="Netra"
      class="h-10 w-10"
    />
    <NuxtLink
      v-if="props.withLabel"
      class="text-sm whitespace-nowrap text-foreground"
      >Netra PFA Cloud ©</NuxtLink
    >
  </span>
</template>
