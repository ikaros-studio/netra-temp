<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  getYear,
  isSameDay,
  isSameMonth,
  isToday,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { cn } from '@/modules/ui/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: Date
    mode?: 'single' | 'range' | 'multiple'
    monthsToDisplay?: number
    class?: string
    disabledDates?: Date[]
    minDate?: Date
    maxDate?: Date
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    closeOnSelect?: boolean
  }>(),
  {
    monthsToDisplay: 1,
    mode: 'single',
    firstDayOfWeek: 0,
    closeOnSelect: true
  }
)

const emit = defineEmits<{
  'update:modelValue': [Date | Date[] | undefined]
  'close': []
}>()

const currentMonth = ref(props.modelValue ? new Date(props.modelValue) : new Date())
const viewedMonth = ref(startOfMonth(currentMonth.value))
const showYearSelector = ref(false)

// Generate years for the selector (current year +/- 100 years)
const currentYear = getYear(new Date())
const years = computed(() => {
  const result = []
  for (let i = currentYear - 100; i <= currentYear + 100; i++) {
    result.push(i)
  }
  return result
})

function isDateDisabled(date: Date) {
  if (props.disabledDates?.some((disabledDate) => isSameDay(disabledDate, date))) {
    return true
  }

  if (props.minDate && date < props.minDate) {
    return true
  }

  if (props.maxDate && date > props.maxDate) {
    return true
  }

  return false
}

function getDays(monthDate: Date) {
  const firstDayOfTheMonth = startOfMonth(monthDate)
  const lastDayOfTheMonth = endOfMonth(monthDate)
  const startDate = startOfWeek(firstDayOfTheMonth, { weekStartsOn: props.firstDayOfWeek })
  const endDate = endOfWeek(lastDayOfTheMonth, { weekStartsOn: props.firstDayOfWeek })

  let date = startDate
  const days = []
  const selectedValues = Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []

  while (date <= endDate) {
    const daysOfWeek = Array(7)
      .fill(0)
      .map((_, i) => {
        const day = addDays(date, i)
        return {
          date: day,
          dayLabel: format(day, 'd'),
          isCurrentMonth: isSameMonth(day, monthDate),
          isToday: isToday(day),
          isSelected: selectedValues.some((selectedValue) => selectedValue && isSameDay(selectedValue, day)),
          isDisabled: isDateDisabled(day),
        }
      })

    days.push(daysOfWeek)
    date = addDays(date, 7)
  }

  return days
}

const days = computed(() => getDays(viewedMonth.value))

function handleDateSelect(day: Date) {
  if (isDateDisabled(day)) return

  if (props.mode === 'single') {
    emit('update:modelValue', day)
  } else if (props.mode === 'multiple') {
    const values = Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []
    const isSelected = values.some((value) => value && isSameDay(value, day))

    let newValues
    if (isSelected) {
      newValues = values.filter((value) => !isSameDay(value, day))
    } else {
      newValues = [...values, day]
    }

    emit('update:modelValue', newValues)
  }
  
  // Close the popover if closeOnSelect is true
  if (props.closeOnSelect) {
    emit('close')
  }
}

function previousMonth() {
  viewedMonth.value = subMonths(viewedMonth.value, 1)
}

function nextMonth() {
  viewedMonth.value = addMonths(viewedMonth.value, 1)
}

function selectYear(year: number) {
  viewedMonth.value = setYear(viewedMonth.value, year)
  showYearSelector.value = false
}

// Update the calendar when modelValue changes
watch(() => props.modelValue, (newDate) => {
  if (newDate && !isSameMonth(viewedMonth.value, newDate)) {
    viewedMonth.value = startOfMonth(newDate)
  }
})

// Helper to safely format dates
function safeFormat(date: Date | null | undefined, formatString: string): string {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return format(date, formatString);
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

const dayNames = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return [
    ...days.slice(props.firstDayOfWeek),
    ...days.slice(0, props.firstDayOfWeek)
  ]
})

// Get current viewed year
const currentViewedYear = computed(() => getYear(viewedMonth.value))
</script>

<template>
  <div :class="cn('inline-block', props.class)">
    <div class="p-3">
      <div class="flex items-center justify-between pb-2">
        <button
          type="button"
          class="p-2 opacity-50 hover:opacity-100"
          @click="previousMonth"
        >
          <ChevronLeft class="size-4" />
          <span class="sr-only">Previous month</span>
        </button>
        <div class="relative">
          <button 
            type="button"
            class="flex items-center text-sm font-medium hover:bg-muted rounded-md px-2 py-1"
            @click="showYearSelector = !showYearSelector"
          >
            {{ safeFormat(viewedMonth, 'MMMM yyyy') }}
            <ChevronDown class="ml-1 size-3" />
          </button>
          
          <!-- Year selector dropdown -->
          <div 
            v-if="showYearSelector" 
            class="absolute z-10 mt-1 max-h-60 w-32 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <div class="grid grid-cols-1 gap-1">
              <button
                v-for="year in years"
                :key="year"
                type="button"
                :class="[
                  'px-2 py-1 text-sm rounded-md text-center',
                  year === currentViewedYear ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                ]"
                @click="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="p-2 opacity-50 hover:opacity-100"
          @click="nextMonth"
        >
          <ChevronRight class="size-4" />
          <span class="sr-only">Next month</span>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center">
        <div
          v-for="(day, i) in dayNames"
          :key="i"
          class="text-xs text-muted-foreground"
        >
          {{ day }}
        </div>
      </div>
      <div v-for="(week, weekIndex) in days" :key="weekIndex" class="grid grid-cols-7 gap-1 mt-1">
        <div
          v-for="(day, dayIndex) in week"
          :key="dayIndex"
          class="flex items-center justify-center"
        >
          <button
            type="button"
            :class="[
              'size-9 p-0 font-normal aria-selected:opacity-100',
              day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50',
              !day.isDisabled
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'text-muted-foreground opacity-50 cursor-default',
              day.isToday ? 'bg-accent text-accent-foreground' : '',
              day.isSelected ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
              'rounded-md',
            ]"
            :disabled="day.isDisabled"
            :aria-selected="day.isSelected"
            @click="handleDateSelect(day.date)"
          >
            {{ day.dayLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 