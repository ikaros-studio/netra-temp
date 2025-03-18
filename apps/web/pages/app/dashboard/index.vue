<script setup lang="ts">
  import { CaseStatusOverview, PortfolioRiskScore, UpcomingReviews, ActiveAlerts } from '~/modules/saas/dashboard/components';
  const { t } = useTranslations();
  const { user } = useUser();

  definePageMeta({
    layout: "saas-app",
  });
</script>

<template>
  <div class="container max-w-6xl py-8">
    <SaasPageHeader>
      <template #title>{{
        t("dashboard.welcome", { name: user?.name })
      }}</template>
      <template #subtitle>{{ $t("dashboard.subtitle") }}</template>
    </SaasPageHeader>

    <!-- Two-column layout for main cards -->
    <div class="mt-8 grid gap-8 md:grid-cols-2">
      <CaseStatusOverview />
      <PortfolioRiskScore />
      <UpcomingReviews />
      <ActiveAlerts />
    </div>
  </div>
</template>
