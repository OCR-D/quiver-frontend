<script setup lang="ts">
import TimelineItem from "@/components/workflows/timeline/TimelineItem.vue"
import Dropdown from 'primevue/dropdown'
import { computed, onBeforeMount, onMounted, ref, watch} from "vue"
import { EvaluationMetrics, getMaxValueByMetric} from '@/helpers/metrics'
import { useI18n } from "vue-i18n"
import type { DropdownOption, EvaluationResultsDocumentWide, Workflow, GroundTruth } from "@/types"
import { DropdownPassThroughStyles } from '@/helpers/pt'
import workflowsStore from '@/store/workflows-store'
import filtersStore from '@/store/filters-store'
import timelineStore from "@/store/timeline-store"
import TrendLegend from "@/components/workflows/TrendLegend.vue";
import TimelineFilters from "./timeline/TimelineFilters.vue"
import TimelineSorting from "./timeline/TimelineSorting.vue"

const { t } = useI18n()
const gtList = computed<GroundTruth[]>(() => workflowsStore.gt.filter(({ id }) => filtersStore.gtTimeline.findIndex(({ value }) => value === id) > -1))
const workflows = ref<Workflow[]>([])
const selectedMetric = ref<DropdownOption | null>(null)
const metrics = computed<DropdownOption[]>(() => Object.keys(EvaluationMetrics).map(key => ({ value: EvaluationMetrics[key], label: t(EvaluationMetrics[key]) })))
const selectedMetricValue = computed<keyof EvaluationResultsDocumentWide>(() => <keyof EvaluationResultsDocumentWide>selectedMetric.value?.value || EvaluationMetrics.CER_MEAN)
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
    <div class="flex mb-4 space-x-4 items-end justify-between">
      <TimelineSorting v-model="sortedGtList" :selectedMetric="selectedMetricValue"/>
      <Dropdown
        v-model="selectedMetric"
        :options="metrics"
        :pt="DropdownPassThroughStyles"
        optionLabel="label"
        placeholder="Select a metric"
        class="grow-0"
        unstyled
      />
    </div>
    <TrendLegend class="ml-auto mb-4"/>
    <TimelineFilters></TimelineFilters>
    <div class="flex flex-col space-y-6">
      <template v-if="sortedGtList.length > 0">
        <TimelineItem v-for="gt in sortedGtList" :key="gt.id" :gt="gt" :metric="selectedMetricValue" />
      </template>
      <template v-else-if="workflowsStore.gt.length > 0 ">
        <div class="my-6">{{ $t('no_documents_selected') }}</div>
      </template>
      <template v-else>
        <div class="my-6">{{ $t('error_please_try_again_later') }}</div>
      </template>
    </div>
  </div>

</template>

<style scoped lang="scss">

</style>
