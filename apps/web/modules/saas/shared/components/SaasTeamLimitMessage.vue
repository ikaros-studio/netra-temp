<script setup lang="ts">
  import { InfoIcon } from "lucide-vue-next";
</script>

<template>
  <div class="rounded-lg border border-info-soft bg-info-soft/20 p-4 text-sm">
    <div class="flex items-start gap-3">
      <InfoIcon class="mt-0.5 size-5 text-info" />
      <div>
        <h3 class="font-medium text-foreground">
          {{ $t("teamLimit.title") }}
        </h3>
        <p class="mt-1 text-muted-foreground">
          {{ $t("teamLimit.description") }}
        </p>
        <p class="mt-3">
          <a
            href="mailto:support@yourcompany.com"
            class="text-primary hover:underline"
          >
            {{ $t("teamLimit.contactSupport") }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template> 