<script setup lang="ts">
import type { DropdownOption, EvaluationResultsDocumentWide, GroundTruth } from "@/types"
import { computed, ref, watch } from "vue"
import Dropdown from "primevue/dropdown"
import { GTTimelineSortingOptions, sortByOption } from "@/helpers/sorting"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
  modelValue: GroundTruth[],
  selectedMetric: keyof EvaluationResultsDocumentWide
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', payload: GroundTruth[]): void
}>()

const sortOptions = computed<DropdownOption[]>(() => 
  Object.keys(GTTimelineSortingOptions).map(key => 
    ({ value: GTTimelineSortingOptions[key as keyof typeof GTTimelineSortingOptions],
      label: t(GTTimelineSortingOptions[key as keyof typeof GTTimelineSortingOptions])
    })
  )
)
const selectedSortOption = ref<DropdownOption>(sortOptions.value[0])

watch(() => props.modelValue, () => {
  updateSortedList(selectedSortOption.value)
})

watch(() => props.selectedMetric, () => {
  updateSortedList(selectedSortOption.value)
})

function updateSortedList(event: any) {
  const sortedGtList = sortByOption(props.modelValue, event.value, props.selectedMetric)
  emit('update:modelValue', sortedGtList)
}

</script>
<template>
  <div class="w-full">
    <p class="font-semibold mb-2">{{ t('sort_by')}}:</p>
    <Dropdown
    v-model="selectedSortOption"
    @update:model-value="updateSortedList($event)"
    :options="sortOptions"
    option-label="label"
    class="w-full md:w-56"
    />
  </div>
</template>