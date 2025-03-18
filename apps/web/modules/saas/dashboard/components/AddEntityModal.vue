<script setup lang="ts">
import { ref } from 'vue';
import { SearchIcon, CalendarIcon, LoaderIcon } from 'lucide-vue-next';
import { format } from 'date-fns';
import { Label } from '~/modules/ui/components/label';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'entity-added': [];
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

// Manual add functions for individuals and companies
const manualIndividualData = ref({
  name: ''
});

const manualCompanyData = ref({
  name: ''
});

const isAddingManualIndividual = ref(false);
const isAddingManualCompany = ref(false);
const manualIndividualError = ref('');
const manualCompanyError = ref('');

// Additional loading states for saving entities
const isSavingIndividual = ref(null);
const isSavingCompany = ref(null);

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

// Removed parseIndividualResults since it's now handled on the server
// Removed parseCompanyResults since it's now handled on the server

// Search for individuals using server API
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
    // Create payload with search parameters
    const payload = {
      name: individual.value.name
    };
    
    // Add optional fields if they have values
    if (individual.value.birth_date) {
      payload.birth_date = individual.value.birth_date;
    }
    
    if (individual.value.country) {
      payload.country = individual.value.country;
    }
    
    // Call our server API endpoint instead of Perplexity directly
    const response = await fetch('/api/search/individuals', {
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
    
    // Set the results directly from the response
    individualResults.value = data.results || [];
    
    if (individualResults.value.length === 0) {
      individualSearchError.value = 'No results found for this individual';
    }
  } catch (error) {
    console.error('Failed to search individuals:', error);
    individualSearchError.value = error.message || 'Failed to search individuals';
  } finally {
    isLoadingIndividuals.value = false;
  }
};

// Search for companies using server API
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
    // Create payload with search parameters
    const payload = {
      company_name: company.value.company_name
    };
    
    // Add optional fields if they have values
    if (company.value.company_registration_number) {
      payload.company_registration_number = company.value.company_registration_number;
    }
    
    if (company.value.country) {
      payload.country = company.value.country;
    }
    
    if (company.value.industry) {
      payload.industry = company.value.industry;
    }
    
    // Call our server API endpoint instead of Perplexity directly
    const response = await fetch('/api/search/companies', {
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
    
    // Set the results directly from the response
    companyResults.value = data.results || [];
    
    if (companyResults.value.length === 0) {
      companySearchError.value = 'No results found for this company';
    }
  } catch (error) {
    console.error('Failed to search companies:', error);
    companySearchError.value = error.message || 'Failed to search companies';
  } finally {
    isLoadingCompanies.value = false;
  }
};

// Handle image error and replace with a default image
const handleImageError = (event) => {
  event.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(event.target.alt) + '&background=random';
};

// Function to format URL for display
const formatUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
};

// Start manual individual add process
const startManualIndividualAdd = () => {
  manualIndividualData.value.name = individual.value.name || '';
  isAddingManualIndividual.value = true;
};

// Start manual company add process
const startManualCompanyAdd = () => {
  manualCompanyData.value.name = company.value.company_name || '';
  isAddingManualCompany.value = true;
};

// Save manual individual to database
const saveManualIndividual = async () => {
  if (!manualIndividualData.value.name) {
    manualIndividualError.value = 'Name is required';
    return;
  }
  
  manualIndividualError.value = '';
  
  try {
    const response = await fetch('/api/entities/person', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: manualIndividualData.value.name
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      isAddingManualIndividual.value = false;
      emit('entity-added');
      emit('update:open', false);
    } else {
      throw new Error(data.body?.error || 'Failed to save individual');
    }
  } catch (error) {
    console.error('Error saving individual:', error);
    manualIndividualError.value = error.message || 'Failed to save individual';
  }
};

// Save manual company to database
const saveManualCompany = async () => {
  if (!manualCompanyData.value.name) {
    manualCompanyError.value = 'Company name is required';
    return;
  }
  
  manualCompanyError.value = '';
  
  try {
    const response = await fetch('/api/entities/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: manualCompanyData.value.name
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      isAddingManualCompany.value = false;
      emit('entity-added');
      emit('update:open', false);
    } else {
      throw new Error(data.body?.error || 'Failed to save company');
    }
  } catch (error) {
    console.error('Error saving company:', error);
    manualCompanyError.value = error.message || 'Failed to save company';
  }
};

// Add a specific individual search result to the database
const addSearchResultIndividual = async (result, index) => {
  isSavingIndividual.value = index;
  
  try {
    // Format the name from first_name and last_name
    const name = [result.first_name, result.last_name].filter(Boolean).join(' ');
    
    if (!name) {
      throw new Error('No name available for this individual');
    }
    
    const response = await fetch('/api/entities/person', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Show success feedback (could be a toast notification in a real app)
      alert(`Added ${name} to your entities`);
      emit('entity-added');
      emit('update:open', false);
    } else {
      throw new Error(data.body?.error || 'Failed to save individual');
    }
  } catch (error) {
    console.error('Error saving individual:', error);
    alert(error.message || 'Failed to save individual');
  } finally {
    isSavingIndividual.value = null;
  }
};

// Add a specific company search result to the database
const addSearchResultCompany = async (result, index) => {
  isSavingCompany.value = index;
  
  try {
    if (!result.company_name) {
      throw new Error('No company name available');
    }
    
    const response = await fetch('/api/entities/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: result.company_name
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Show success feedback (could be a toast notification in a real app)
      alert(`Added ${result.company_name} to your entities`);
      emit('entity-added');
      emit('update:open', false);
    } else {
      throw new Error(data.body?.error || 'Failed to save company');
    }
  } catch (error) {
    console.error('Error saving company:', error);
    alert(error.message || 'Failed to save company');
  } finally {
    isSavingCompany.value = null;
  }
};
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[650px] max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle class="text-center text-2xl">Add a person or company</DialogTitle>
      </DialogHeader>
      
      <div class="overflow-y-auto pr-1 custom-scrollbar">
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
                    <LoaderIcon v-if="isLoadingIndividuals" class="mr-2 h-4 w-4 animate-spin" />
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
            
            <!-- Results section for individuals -->
            <div v-if="individualSearchError" class="text-red-500 text-center mb-6">
              {{ individualSearchError }}
              
              <!-- Show manual add option when no results found -->
              <div v-if="individualSearchError.includes('No results')" class="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col items-center justify-center">
                <p class="text-center mb-2">Didn't find the entity you were looking for? Add it now</p>
                <Button @click="startManualIndividualAdd">Add Manually</Button>
              </div>
            </div>
            
            <div v-else-if="isLoadingIndividuals" class="py-8">
              <div class="flex flex-col items-center justify-center gap-2">
                <LoaderIcon class="h-8 w-8 animate-spin text-primary" />
                <p class="text-sm text-muted-foreground">Searching for individuals...</p>
              </div>
            </div>
            
            <div v-else-if="individualResults.length > 0" class="mb-8">
              <div class="text-lg font-medium mb-2">Search Results</div>
              <div class="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <div v-for="(result, index) in individualResults" :key="index"
                     class="mb-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div class="flex">
                    <div class="mr-4 flex-shrink-0">
                      <img 
                        :src="result.profile_image_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent([result.first_name, result.last_name].filter(Boolean).join(' ')) + '&background=random'" 
                        :alt="[result.first_name, result.last_name].filter(Boolean).join(' ')"
                        class="h-16 w-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                        @error="handleImageError"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="grid grid-cols-1 gap-1 mb-2">
                        <div class="text-lg font-medium dark:text-gray-200 truncate">
                          {{ [result.first_name, result.last_name].filter(Boolean).join(' ') || '-' }}
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
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
                    <div class="ml-4 flex-shrink-0 flex items-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        @click="addSearchResultIndividual(result, index)"
                        :disabled="isSavingIndividual === index"
                      >
                        <LoaderIcon v-if="isSavingIndividual === index" class="mr-2 h-3 w-3 animate-spin" />
                        {{ isSavingIndividual === index ? 'Adding...' : 'Add' }}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Add manual entry box -->
              <div class="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col items-center justify-center">
                <p class="text-center mb-2">Didn't find the entity you were looking for? Add it now</p>
                <Button @click="startManualIndividualAdd">Add Manually</Button>
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
                    <LoaderIcon v-if="isLoadingCompanies" class="mr-2 h-4 w-4 animate-spin" />
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
            
            <!-- Results section for companies -->
            <div v-if="companySearchError" class="text-red-500 text-center mb-6">
              {{ companySearchError }}
              
              <!-- Show manual add option when no results found -->
              <div v-if="companySearchError.includes('No results')" class="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col items-center justify-center">
                <p class="text-center mb-2">Didn't find the entity you were looking for? Add it now</p>
                <Button @click="startManualCompanyAdd">Add Manually</Button>
              </div>
            </div>
            
            <div v-else-if="isLoadingCompanies" class="py-8">
              <div class="flex flex-col items-center justify-center gap-2">
                <LoaderIcon class="h-8 w-8 animate-spin text-primary" />
                <p class="text-sm text-muted-foreground">Searching for companies...</p>
              </div>
            </div>
            
            <div v-else-if="companyResults.length > 0" class="mb-8">
              <div class="text-lg font-medium mb-2">Search Results</div>
              <div class="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <div v-for="(result, index) in companyResults" :key="index"
                     class="mb-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 hover:border-primary hover:shadow-md transition-all">
                  <div class="grid grid-cols-1 gap-1 mb-2">
                    <div class="flex justify-between items-center">
                      <div class="text-lg font-medium dark:text-gray-200 truncate">
                        {{ result.company_name || '-' }}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        @click="addSearchResultCompany(result, index)"
                        :disabled="isSavingCompany === index"
                      >
                        <LoaderIcon v-if="isSavingCompany === index" class="mr-2 h-3 w-3 animate-spin" />
                        {{ isSavingCompany === index ? 'Adding...' : 'Add' }}
                      </Button>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Registration Number</div>
                      <div class="font-medium dark:text-gray-200">{{ result.company_registration_number || '-' }}</div>
                    </div>
                    <div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Country</div>
                      <div class="font-medium dark:text-gray-200">{{ result.country || '-' }}</div>
                    </div>
                    <div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Industry</div>
                      <div class="font-medium dark:text-gray-200">{{ result.industry || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Add manual entry box -->
              <div class="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col items-center justify-center">
                <p class="text-center mb-2">Didn't find the entity you were looking for? Add it now</p>
                <Button @click="startManualCompanyAdd">Add Manually</Button>
              </div>
            </div>
            
            <div v-else class="flex items-center justify-center mb-6 text-gray-500 dark:text-gray-400">
              <SearchIcon class="mr-2 size-5" />
              <p>Once you search for a company, the results will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
  
  <!-- Manual Individual Add Dialog -->
  <Dialog v-model:open="isAddingManualIndividual">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Individual Manually</DialogTitle>
        <DialogDescription>
          Enter the individual's information to add them to your entities.
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1 gap-2">
          <Label for="manual-name">Name</Label>
          <Input id="manual-name" v-model="manualIndividualData.name" placeholder="Full name" />
          <p v-if="manualIndividualError" class="text-sm text-red-500">{{ manualIndividualError }}</p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="isAddingManualIndividual = false">Cancel</Button>
        <Button @click="saveManualIndividual">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  
  <!-- Manual Company Add Dialog -->
  <Dialog v-model:open="isAddingManualCompany">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Company Manually</DialogTitle>
        <DialogDescription>
          Enter the company's information to add it to your entities.
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1 gap-2">
          <Label for="manual-company-name">Company Name</Label>
          <Input id="manual-company-name" v-model="manualCompanyData.name" placeholder="Company name" />
          <p v-if="manualCompanyError" class="text-sm text-red-500">{{ manualCompanyError }}</p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="isAddingManualCompany = false">Cancel</Button>
        <Button @click="saveManualCompany">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>