<script setup lang="ts">
import filtersStore from "@/store/filters-store"
import workflowsStore from "@/store/workflows-store"
import { computed, onMounted, ref } from "vue"
import MultiSelect from "primevue/multiselect"
import type { DropdownOption, GroundTruth } from "@/types"
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
const selectedDateRange = ref<DropdownOption[]>([])

const workflowOptions = computed(() => workflowsStore.workflows.map(({ id, label }) => ({ value: id, label })))
const selectedWorkflows = ref<DropdownOption[]>([])

const workflowStepOptions = ref<DropdownOption[]>([])
const selectedWorkflowSteps = ref<DropdownOption[]>([])

const dateRangeDropdownLabel = computed(() => {
  if (dateRangeOptions.value.length === selectedDateRange.value.length) {
    return t('filter_by_date_range')
  }
  return null
})

const workflowDropdownLabel = computed(() => {
  if (workflowOptions.value.length === selectedWorkflows.value.length) {
    return t('filter_by_workflow')
  }
  return null
})

const workflowStepDropdownLabel = computed(() => {
  if (workflowStepOptions.value.length === selectedWorkflowSteps.value.length) {
    return t('filter_by_processor')
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
  filtersStore.gtTimeline = filtersStore.gt.filter(({ value }) => {
    const gt = workflowsStore.getGtById(value)
    if(!gt) return false
    return hasSomeSelectedProcessor(gt) && hasSomeSelectedDateRange(gt) && hasSomeSelectedWorkflow(gt)
  })
}

const selectWorkflows = () => {
  filtersStore.workflow = selectedWorkflows.value.filter(({ value }) => (workflowhasSomeSelectedWorkflowStep(value)))
}

const hasSomeSelectedProcessor = (gt: GroundTruth) => {
  const gtRuns = workflowsStore.getRuns(gt.id)
  return selectedWorkflowSteps.value.some((selectedStep) => {
    return gtRuns.some((gtRun) => {
      return gtRun.metadata.workflow_steps.findIndex(({ id }) => id === selectedStep.value) > -1
    })
  })
}

const hasSomeSelectedDateRange = (gt: GroundTruth) => {
  return selectedDateRange.value.some(({ value }) => {
    const splitDateRange = value.split('-')
    const from = splitDateRange[0]
    const to = splitDateRange[1]
    return gt.metadata.time.notBefore === from && gt.metadata.time.notAfter === to
  })
}

const hasSomeSelectedWorkflow = (gt: GroundTruth) => {
  const gtRuns = workflowsStore.getRuns(gt.id)
  return gtRuns.some((gtRun) => {
    return selectedWorkflows.value.findIndex(({ value }) => (value === mapGtId(gtRun.metadata.ocr_workflow.id))) > -1 
  })
}

const workflowhasSomeSelectedWorkflowStep = (workflowId: string) => {
  const workflow = workflowsStore.getWorkflowById(workflowId)
  if (workflow == null) return false
  return workflow.steps.some((step) => selectedWorkflowSteps.value.findIndex(({ value }) => (value === step.id)) > -1)
}

onMounted(() => {
  workflowStepOptions.value = deduplicateStepIds(workflowsStore.workflows).map(id => ({ value: id, label: t(id) }))
  
  selectedDateRange.value = dateRangeOptions.value
  selectedWorkflows.value = workflowOptions.value
  selectedWorkflowSteps.value = workflowStepOptions.value
  
  selectGTs()
  selectWorkflows()
})
</script>

<template>
<div class="flex flex-wrap mb-4 justify-start lg:justify-end">
  <MultiSelect
    v-model="selectedDateRange"
    @update:model-value="onDateRangeChange($event)"
    :max-selected-labels="1"
    :options="dateRangeOptions"
    optionLabel="label"
    :placeholder="t('select_a_date_range')"
    :selected-items-label="dateRangeDropdownLabel"
    class="mr-4 mb-2 lg:m-0 lg:ml-auto md:w-14rem"
  />
  <MultiSelect
    v-model="selectedWorkflows"
    @update:model-value="onWorkflowChange($event)"
    :max-selected-labels="1"
    :options="workflowOptions"
    optionLabel="label"
    :placeholder="t('select_a_workflow')"
    :selected-items-label="workflowDropdownLabel"
    class="mr-4 mb-2 lg:m-0 lg:ml-4 md:w-14rem"
  />
  <MultiSelect
    v-model="selectedWorkflowSteps"
    @update:model-value="onWorkflowStepChange($event)"
    filter
    :max-selected-labels="1"
    :options="workflowStepOptions"
    optionLabel="label"
    :placeholder="t('select_a_processor')"
    :selected-items-label="workflowStepDropdownLabel"
    class="lg:ml-4 md:w-14rem"
  />
</div>

</template>