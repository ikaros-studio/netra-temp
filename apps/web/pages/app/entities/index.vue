<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  layout: "saas-app",
});

// Define the customer/entity type
interface Entity {
  id: string;
  name: string;
  type: string;
  caseStatus: string;
  registration: string;
  riskLevel: string;
  riskScore?: number;
  lastUpdate: string;
  dueDate: string;
}

// Data for customers/entities
const customers = ref<Entity[]>([]);

// Active customer for dropdown
const activeCustomer = ref<string | null>(null);
const isActionOpen = ref(false);

const search = ref('');

// Loading state
const isLoading = ref(true);
const error = ref<string | null>(null);

// Add entity modal state
const isAddEntityModalOpen = ref(false);

// Fetch entities from the API
const fetchEntities = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/entities');
    
    const data = await response.json();
    
    if (!response.ok) {
      // Check for authentication errors
      if (response.status === 401) {
        throw new Error(data.body?.message || 'Please log in to view entities');
      } else if (response.status === 400 && data.body?.error?.includes('team')) {
        throw new Error(data.body?.message || 'You need to be part of a team to view entities');
      } else {
        throw new Error(data.body?.message || 'Failed to fetch entities');
      }
    }
    
    if (data.success) {
      customers.value = data.data;
    } else {
      throw new Error(data.body?.message || data.body?.error || 'Failed to fetch entities');
    }
  } catch (err) {
    console.error('Error fetching entities:', err);
    error.value = err.message || 'Failed to fetch entities';
    // Keep a few mock entities for UI display in case of error
    customers.value = [
      {
        id: '1',
        name: "Example Company",
        type: "Company",
        caseStatus: "Not Started",
        registration: "Demo",
        riskLevel: "Not Applicable",
        lastUpdate: "14 Feb, 2025",
        dueDate: "30 Sep, 2025"
      }
    ];
  } finally {
    isLoading.value = false;
  }
};

// Toggle action menu
const toggleActions = (customer) => {
  if (activeCustomer.value === customer.id) {
    isActionOpen.value = !isActionOpen.value;
  } else {
    activeCustomer.value = customer.id;
    isActionOpen.value = true;
  }
};

// Handle entity added and refresh the list
const handleEntityAdded = () => {
  fetchEntities();
  isAddEntityModalOpen.value = false;
};

// Load entities when component is mounted
onMounted(() => {
  fetchEntities();
});

// Mock function to handle actions
const handleAction = (action, customer) => {
  console.log(`${action} for ${customer.name}`);
  isActionOpen.value = false;
  
  if (action === 'delete') {
    // Show confirmation dialog or directly delete
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      // In a real implementation, we would call an API to delete the entity
      fetchEntities(); // Refresh the list after deletion
    }
  }
};
</script>

<template>
  <div class="container max-w-6xl py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-semibold">All Entities</h1>
      
      <!-- Add Entity Button -->
      <Button @click="isAddEntityModalOpen = true" class="bg-primary text-white">
        Add Entity
      </Button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="flex-1 relative">
        <input 
          v-model="search"
          type="text" 
          placeholder="Search" 
          class="w-full px-4 py-2 pr-10 rounded-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div class="flex gap-4">
        <select class="px-4 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <option>All Case Statuses</option>
          <option>Not Started</option>
          <option>Verified</option>
          <option>Rejected</option>
          <option>Escalated</option>
        </select>
        
        <select class="px-4 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <option>All Countries</option>
          <option>Germany</option>
          <option>UK</option>
          <option>USA</option>
          <option>France</option>
        </select>
      </div>
    </div>

    <SaasLoadingSpinner v-if="isLoading" />
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-4">
      <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      <Button @click="fetchEntities" class="mt-2">Try Again</Button>
    </div>
    
    <div v-else-if="customers.length === 0" class="text-center py-12">
      <div class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No entities found</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">Adjust your filters or add an entity.</p>
    </div>
    
    <div v-else class="overflow-x-auto rounded-lg border dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Customer Name
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Type ↓
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Case Status
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Registration
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Risk Level
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Last Update ↓
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
              Due Date ↓
            </th>
            <th class="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              <router-link :to="`/app/entities/${customer.id}`" class="text-primary hover:underline">
                {{ customer.name }}
              </router-link>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ customer.type }}
            </td>
            <td class="px-6 py-4 text-sm">
              <span 
                class="inline-block px-3 py-1 text-sm rounded-md" 
                :class="customer.caseStatus === 'Verified' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ customer.caseStatus }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ customer.registration }}
            </td>
            <td class="px-6 py-4 text-sm">
              <span 
                v-if="customer.riskLevel === 'Medium'" 
                class="inline-block px-3 py-1 text-sm rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              >
                Medium ({{ customer.riskScore }})
              </span>
              <span 
                v-else 
                class="inline-block px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ customer.riskLevel }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ customer.lastUpdate }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ customer.dueDate }}
            </td>
            <td class="px-6 py-4 text-center text-sm relative">
              <button 
                @click="toggleActions(customer)" 
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              <!-- Action dropdown menu -->
              <div 
                v-if="isActionOpen && activeCustomer === customer.id" 
                class="absolute right-8 top-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div class="py-1">
                  <button 
                    @click="handleAction('start', customer)" 
                    class="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start the case
                  </button>
                  
                  <button 
                    @click="handleAction('view', customer)" 
                    class="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <router-link :to="`/app/entities/${customer.id}`">View the customer</router-link>
                  </button>
                  
                  <button 
                    @click="handleAction('delete', customer)" 
                    class="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete this customer
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Add Entity Modal -->
  <AddEntityModal 
    v-model:open="isAddEntityModalOpen" 
    @entity-added="handleEntityAdded" 
  />
</template>
