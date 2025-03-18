<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { EntityDetail, ComplianceGraph, RiskScore, ComplianceCertificate } from '~/modules/saas/entities/components';
import { Card, CardHeader, CardTitle, CardContent } from '~/modules/ui/components/card';

// Define the page layout
definePageMeta({
  layout: "saas-app",
});

// Get the entity ID from the route
const route = useRoute();
const entityId = computed(() => route.params.id);

// Mock entity data
// In a real application, this would be fetched from an API based on the ID
const entity = ref({
  id: entityId,
  name: "Otto Company",
  type: "Company",
  caseStatus: "Not Started",
  registration: "Germany",
  riskLevel: "Not Applicable",
  lastUpdate: "14 Feb, 2025",
  dueDate: "30 Sep, 2025",
  ein: "EIN123456789",
  incorporationDate: "Dec 9, 2015",
  jurisdiction: "Cayman Islands",
  riskDetails: {
    score: null,
    pepPercentage: "-",
    sanctionsPercentage: "-",
    adverseMediaPercentage: "-",
    status: "Pending Risk"
  }
});

// Mock compliance checks data
const complianceChecks = ref([
  {
    type: "Politically Exposed Person",
    status: "Verified",
    source: "By Global PEP databases, government watchlists"
  },
  {
    type: "Sanctions Screening",
    status: "Verified",
    source: "By OFAC, EU Sanctions List"
  },
  {
    type: "Adverse Media",
    status: "Verified",
    source: "By Global news databases"
  },
  {
    type: "Business Activities Verification",
    status: "Verified",
    source: "By Company registries, annual reports"
  },
  {
    type: "AML Risk Assessment",
    status: "Pending",
    source: "By Financial Intelligence Units"
  }
]);

// Loading state
const isLoading = ref(true);

// Simulate loading
setTimeout(() => {
  isLoading.value = false;
}, 1000);
</script>

<template>
  <div class="container max-w-6xl py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-semibold">{{ entity.name }}</h1>
      <Button class="bg-primary text-white" variant="default">Download Report</Button>
    </div>

    <SaasLoadingSpinner v-if="isLoading" />
    
    <div v-else>
      <!-- Entity Overview -->
      <EntityDetail :entity="entity" class="mb-8" />
      
      <!-- Two-column layout for Risk Score and Compliance Graph -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RiskScore v-if="entity.riskDetails" :risk-details="entity.riskDetails" />
        <ComplianceGraph :entity-id="entityId" />
      </div>
      
      <!-- Compliance Certificate -->
      <ComplianceCertificate 
        :entity-id="entityId" 
        :entity-name="entity.name"
        :compliance-checks="complianceChecks"
      />
    </div>
  </div>
</template> 