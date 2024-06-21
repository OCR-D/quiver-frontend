<script setup lang="ts">
import filtersStore from "@/store/filters-store"
import workflowsStore from "@/store/workflows-store"
import { computed, onMounted, ref } from "vue"
import Dropdown from "primevue/dropdown"
import MultiSelect from "primevue/multiselect"
import { type FilterOption, type DropdownOption, type GroundTruth } from "@/types"
import { DropdownPassThroughStyles } from '@/helpers/pt'
import { deduplicateStepIds, mapGtId } from '@/helpers/utils'
import { useI18n } from "vue-i18n"


const { t } = useI18n()

const dateRangeOptions = computed(() => {
  const values = workflowsStore.gt.reduce((acc, cur) => {
    acc.add(`${cur.metadata.time.notBefore}-${cur.metadata.time.notAfter}`)
    return acc
  }, new Set<string>())
  return Array.from(values).sort().map(value => ({ value, label: value }))
})

const selectedDateRange = ref<DropdownOption | null>()
//const dateRangeOptions = computed<DropdownOption[]>(() => filtersStore.dateRange)

const workflowOptions = computed(() => workflowsStore.workflows.map(({ id, label }) => ({ value: id, label })))
//const workflowOptions = computed<DropdownOption[]>(() => filtersStore.workflow)
const selectedWorkflows = ref<DropdownOption[]>([])

const workflowStepOptions = ref<DropdownOption[]>([])
const selectedWorkflowSteps = ref<DropdownOption[]>([])

const workflowDropdownLabel = computed(() => {
  if (workflowStepOptions.value.length === selectedWorkflowSteps.value.length) {
    return t('Filter by workflow')
  }
  return null
})

const workflowStepDropdownLabel = computed(() => {
  if (workflowStepOptions.value.length === selectedWorkflowSteps.value.length) {
    return t('Filter by processor')
  }
  return null
})

const onDateRangeChange = (event: any) => {
  selectedDateRange.value = event
  selectGTs()
}

const onWorkflowChange = (event: any) => {
  selectedWorkflows.value = event
  selectGTs()
  selectWorkflows()
}

const onWorkflowStepChange = (event: any) => {
  selectedWorkflowSteps.value = event
  selectGTs()
  selectWorkflows()
}

const selectGTs = () => {
  filtersStore.gtTimeline = filtersStore.gt.filter(({value}) => {
    const gt = workflowsStore.getGtById(value)
    if(!gt) return false
    return hasSomeSelectedProcessor(gt) && hasSelectedDateRange(gt) && hasSomeSelectedWorkflow(gt)
  })
}

function hasSomeSelectedProcessor(gt: GroundTruth) {
  if (selectedWorkflowSteps.value.length <= 0) return false
  const gtRuns = workflowsStore.getRuns(gt.id)
  return selectedWorkflowSteps.value.some((selectedStep) => {
    return gtRuns.some((gtRun) => {
      return gtRun.metadata.workflow_steps.findIndex(({ id }) => id === selectedStep.value) > -1
    })
  })
}

function hasSelectedDateRange(gt: GroundTruth) {
  if (!selectedDateRange.value) return true //later false if multiselect
  const splitDateRange = selectedDateRange.value.value.split('-')
  const from = splitDateRange[0]
  const to = splitDateRange[1]
  return gt.metadata.time.notBefore === from && gt.metadata.time.notAfter === to
}

function hasSomeSelectedWorkflow(gt: GroundTruth) {
  if (selectedWorkflows.value.length <= 0) return false
  const gtRuns = workflowsStore.getRuns(gt.id)
  return gtRuns.some((gtRun) => {
    return selectedWorkflows.value.findIndex(({ value }) => (value === mapGtId(gtRun.metadata.ocr_workflow.id)))
  })
}

const selectWorkflows = () => {
  filtersStore.workflow = selectedWorkflows.value.filter(({value}) => (workflowhasSomeSelectedWorkflowStep(value)))
}

function workflowhasSomeSelectedWorkflowStep(workflowId: string) {
  const workflow = workflowsStore.getWorkflowById(workflowId)
  if (workflow == null) return false
  return workflow.steps.some((step) => selectedWorkflowSteps.value.findIndex(({value}) => (value === step.id)) > -1)
}

onMounted(() => {
  //filtersStore.workflow =  workflowOptions.value
  //filtersStore.dateRange = dateRangeOptions.value
  workflowStepOptions.value = deduplicateStepIds(workflowsStore.workflows).map(id => ({ value: id, label: t(id) }))
  selectedWorkflowSteps.value = workflowStepOptions.value
  selectedWorkflows.value = workflowOptions.value
  selectGTs()
})
</script>

<template>
<div class="flex w-full mb-4">
  <Dropdown
    v-model="selectedDateRange"
    @update:model-value="onDateRangeChange($event)"
    :max-selected-labels="1"
    :options="dateRangeOptions"
    :pt="DropdownPassThroughStyles"
    optionLabel="label"
    :placeholder="t('Select a date range')"
    showClear
    class="ml-auto md:w-14rem"
    unstyled
  />
  <MultiSelect
    v-model="selectedWorkflows"
    @update:model-value="onWorkflowChange($event)"
    filter
    :max-selected-labels="1"
    :options="workflowOptions"
    optionLabel="label"
    :placeholder="t('Select a workflow')"
    :selected-items-label="workflowDropdownLabel"
    class="ml-4 md:w-14rem"
  />
  <MultiSelect
    v-model="selectedWorkflowSteps"
    @update:model-value="onWorkflowStepChange($event)"
    filter
    :max-selected-labels="1"
    :options="workflowStepOptions"
    optionLabel="label"
    :placeholder="t('Select a processor')"
    :selected-items-label="workflowStepDropdownLabel"
    class="ml-4 md:w-14rem"
  />
</div>

</template>

<style scoped lang="scss">

</style>