<script setup lang="ts">
import { ref } from 'vue';
import { SearchIcon, CalendarIcon } from 'lucide-vue-next';
import { format } from 'date-fns';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const activeTab = ref('individual');

// Form data for individual search
const individual = ref({
  name: '', // Single name field instead of first_name and last_name
  birth_date: '',
  country: ''
});

// Form data for company search
const company = ref({
  company_name: '',
  company_registration_number: '',
  country: '',
  industry: ''
});

// Search results
const individualResults = ref([]);
const companyResults = ref([]);

// Loading states
const isLoadingIndividuals = ref(false);
const isLoadingCompanies = ref(false);

// Search error messages
const individualSearchError = ref('');
const companySearchError = ref('');

// Handle key press for individual search
const handleIndividualKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchIndividuals();
  }
};

// Handle key press for company search
const handleCompanyKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchCompanies();
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Date picker state
const date = ref(null);
const isDatePickerOpen = ref(false);

// Update individual birthdate when date changes
const updateBirthDate = () => {
  if (date.value) {
    individual.value.birth_date = format(date.value, 'yyyy-MM-dd');
  } else {
    individual.value.birth_date = '';
  }
};

// Close the date picker
const closeDatePicker = () => {
  isDatePickerOpen.value = false;
};

// Search for individuals
const searchIndividuals = async () => {
  // Require name
  if (!individual.value.name) {
    individualSearchError.value = 'Please enter a name';
    return;
  }

  individualSearchError.value = '';
  isLoadingIndividuals.value = true;
  individualResults.value = [];
  
  try {
    // Split the name into first and last name parts
    const nameParts = individual.value.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Create payload with only non-empty values
    const payload = {
      first_name: firstName,
      last_name: lastName
    };
    
    // Only add optional fields if they have values
    if (individual.value.birth_date) {
      payload.birth_date = individual.value.birth_date;
    }
    
    if (individual.value.country) {
      payload.country = individual.value.country;
    }
    
    const response = await fetch('https://f810-178-24-236-170.ngrok-free.app/api/search_individuals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    individualResults.value = Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Failed to search individuals:', error);
    individualSearchError.value = error.message || 'Failed to search individuals';
  } finally {
    isLoadingIndividuals.value = false;
  }
};

// Search for companies
const searchCompanies = async () => {
  // Require company name
  if (!company.value.company_name) {
    companySearchError.value = 'Please enter a company name';
    return;
  }
  
  companySearchError.value = '';
  isLoadingCompanies.value = true;
  companyResults.value = [];
  
  try {
    // Create payload with only non-empty values
    const payload = {
      company_name: company.value.company_name
    };
    
    // Only add optional fields if they have values
    if (company.value.company_registration_number) {
      payload.company_registration_number = company.value.company_registration_number;
    }
    
    if (company.value.country) {
      payload.country = company.value.country;
    }
    
    if (company.value.industry) {
      payload.industry = company.value.industry;
    }
    
    const response = await fetch('https://f810-178-24-236-170.ngrok-free.app/api/search_companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    companyResults.value = Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Failed to search companies:', error);
    companySearchError.value = error.message || 'Failed to search companies';
  } finally {
    isLoadingCompanies.value = false;
  }
};
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[650px]">
      <DialogHeader>
        <DialogTitle class="text-center text-2xl">Add a person or company</DialogTitle>
      </DialogHeader>
      
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <!-- Search field with inline button -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1">Full Name*</label>
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Input 
                  v-model="individual.name" 
                  placeholder="Enter person name" 
                  class="w-full pr-24" 
                  @keypress="handleIndividualKeyPress"
                />
                <Button 
                  @click="searchIndividuals" 
                  :disabled="isLoadingIndividuals"
                  class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-4"
                >
                  {{ isLoadingIndividuals ? 'Searching...' : 'Search' }}
                </Button>
              </div>
            </div>
          </div>
          
          <!-- Optional fields below (smaller) -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Date of Birth (Optional)</label>
              <Popover v-model:open="isDatePickerOpen">
                <PopoverTrigger :as-child="true">
                  <Button 
                    variant="outline" 
                    class="w-full h-8 justify-start text-left font-normal text-sm px-3"
                    :class="!individual.birth_date && 'text-muted-foreground'"
                    type="button"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ individual.birth_date ? formatDate(individual.birth_date) : 'Pick a date' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar
                    v-model="date"
                    mode="single"
                    @update:model-value="updateBirthDate"
                    @close="closeDatePicker"
                    class="border rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Country (Optional)</label>
              <Input 
                v-model="individual.country" 
                placeholder="e.g. United States" 
                class="h-8 text-sm" 
                @keypress="handleIndividualKeyPress"
              />
            </div>
          </div>
          
          <!-- Results panel -->
          <div v-if="individualSearchError" class="text-red-500 text-center mb-6">
            {{ individualSearchError }}
          </div>
          
          <div v-else-if="individualResults.length > 0" class="mb-8">
            <div class="text-lg font-medium mb-2">Search Results</div>
            <div class="grid grid-cols-3 gap-4 mb-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700" 
                 v-for="(result, index) in individualResults" :key="index">
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Name</div>
                <div class="font-medium dark:text-gray-200">
                  {{ [result.first_name, result.last_name].filter(Boolean).join(' ') || '-' }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Date of Birth</div>
                <div class="font-medium dark:text-gray-200">{{ formatDate(result.birth_date) || '-' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Country</div>
                <div class="font-medium dark:text-gray-200">{{ result.country || '-' }}</div>
              </div>
            </div>
          </div>
          
          <div v-else class="flex items-center justify-center mb-6 text-gray-500 dark:text-gray-400">
            <SearchIcon class="mr-2 size-5" />
            <p>Once you search for an individual, the results will be displayed here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="company">
          <!-- Search field with inline button -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1">Company Name*</label>
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Input 
                  v-model="company.company_name" 
                  placeholder="Enter company name" 
                  class="w-full pr-24" 
                  @keypress="handleCompanyKeyPress"
                />
                <Button 
                  @click="searchCompanies" 
                  :disabled="isLoadingCompanies"
                  class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-4"
                >
                  {{ isLoadingCompanies ? 'Searching...' : 'Search' }}
                </Button>
              </div>
            </div>
          </div>
          
          <!-- Optional fields below (smaller) -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Registration Number</label>
              <Input 
                v-model="company.company_registration_number" 
                placeholder="e.g. 12345678" 
                class="h-8 text-sm" 
                @keypress="handleCompanyKeyPress"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Country</label>
              <Input 
                v-model="company.country" 
                placeholder="e.g. United States" 
                class="h-8 text-sm" 
                @keypress="handleCompanyKeyPress"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Industry</label>
              <Input 
                v-model="company.industry" 
                placeholder="e.g. Technology" 
                class="h-8 text-sm" 
                @keypress="handleCompanyKeyPress"
              />
            </div>
          </div>
          
          <!-- Results panel -->
          <div v-if="companySearchError" class="text-red-500 text-center mb-6">
            {{ companySearchError }}
          </div>
          
          <div v-else-if="companyResults.length > 0" class="mb-8">
            <div class="text-lg font-medium mb-2">Search Results</div>
            <div class="grid grid-cols-2 gap-4 mb-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700" 
                 v-for="(result, index) in companyResults" :key="index">
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Company Name</div>
                <div class="font-medium dark:text-gray-200">{{ result.company_name || '-' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Registration Number</div>
                <div class="font-medium dark:text-gray-200">{{ result.company_registration_number || '-' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Country</div>
                <div class="font-medium dark:text-gray-200">{{ result.country || '-' }}</div>
              </div>
              <div v-if="result.industry">
                <div class="text-sm text-gray-500 dark:text-gray-400">Industry</div>
                <div class="font-medium dark:text-gray-200">{{ result.industry }}</div>
              </div>
            </div>
          </div>
          
          <div v-else class="flex items-center justify-center mb-6 text-gray-500 dark:text-gray-400">
            <SearchIcon class="mr-2 size-5" />
            <p>Once you search for a company, the results will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>