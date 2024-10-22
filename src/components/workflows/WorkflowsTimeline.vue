<script setup lang="ts">
import TimelineItem from "@/components/workflows/timeline/TimelineItem.vue"
import Dropdown from 'primevue/dropdown'
import { computed, onMounted, ref, watch } from "vue"
import { EvaluationMetrics, getMaxValueByMetric } from '@/helpers/metrics'
import { useI18n } from "vue-i18n"
import type { DropdownOption, EvaluationResultsDocumentWide, Workflow, GroundTruth } from "@/types"
import workflowsStore from '@/store/workflows-store'
import filtersStore from '@/store/filters-store'
import timelineStore from "@/store/timeline-store"
import TrendLegend from "@/components/workflows/TrendLegend.vue"
import TimelineFilters from "./timeline/TimelineFilters.vue"
import TimelineSorting from "./timeline/TimelineSorting.vue"

const { t } = useI18n()
const gtList = computed<GroundTruth[]>(() => workflowsStore.gt.filter(({ id }) => filtersStore.gtTimeline.findIndex(({ value }) => value === id) > -1))
const workflows = ref<Workflow[]>([])
const selectedMetric = ref<DropdownOption | null>(null)
const metrics = computed<DropdownOption[]>(() => Object.keys(EvaluationMetrics).map(key => ({ value: EvaluationMetrics[key], label: t(EvaluationMetrics[key]) })))
const selectedMetricValue = computed<keyof EvaluationResultsDocumentWide>(() => selectedMetric.value?.value as keyof EvaluationResultsDocumentWide || EvaluationMetrics.CER_MEAN)
const sortedGtList = ref<GroundTruth[]>([])


onMounted(async () => {
  selectedMetric.value = metrics.value[0]
  workflows.value = workflowsStore.workflows
})

watch(gtList, () => {
  sortedGtList.value = gtList.value
})

watch(selectedMetric,
  () => timelineStore.setMaxValue(
    selectedMetricValue.value,
    getMaxValueByMetric(selectedMetricValue.value, workflowsStore.runs)
  ),
    { immediate: true }
)
</script>

<template>
  <div class="flex flex-col">
    <div class="flex mb-2 space-x-4 items-end justify-between">
      <TimelineSorting v-model="sortedGtList" :selectedMetric="selectedMetricValue"/>
      <div class="flex flex-col items-start sm:flex-row sm:items-center">
        <p class="font-semibold mb-2 sm:mb-0 sm:mr-4">{{ t('metric') }}:</p>
        <Dropdown
          v-model="selectedMetric"
          :options="metrics"
          optionLabel="label"
          placeholder="Select a metric"
          class="w-full md:w-56"
        />
      </div>
    </div>
    <TrendLegend class="ml-auto"/>
    <TimelineFilters></TimelineFilters>
    <div class="flex flex-col space-y-6">
      <template v-if="sortedGtList.length > 0">
        <TimelineItem v-for="gt in sortedGtList" :key="gt.id" :gt="gt" :metric="selectedMetricValue" />
      </template>
      <template v-else-if="workflowsStore.gt.length > 0 ">
        <div class="my-6">
          <span v-if="filtersStore.gt.length > 0">{{ t('no_results_found') }}</span>
          <span v-else>{{ t('no_documents_selected') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="my-6">{{ $t('error_please_try_again_later') }}</div>
      </template>
    </div>
  </div>

</template>

<style scoped lang="scss">

</style>
