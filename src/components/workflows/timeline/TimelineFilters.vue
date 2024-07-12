<script setup lang="ts">
import filtersStore from "@/store/filters-store"
import workflowsStore from "@/store/workflows-store"
import { computed, onMounted, ref, watch } from "vue"
import type { DropdownOption, GroundTruth } from "@/types"
import { deduplicateStepIds, mapGtId } from '@/helpers/utils'
import { useI18n } from "vue-i18n"
import BaseMultiSelect from "@/components/base/MultiSelect.vue"


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

/*
Compiles the DropdownOption[] for the labelling filter.

Each gt can have a list of labels, while some have no labelling at all.
The DropdownOption[] is computed by adding all labelling options to a flat list, then making them unique and sorting them. 
*/
const labellingOptions = computed(() => {
  return [
      ...new Set(workflowsStore.gt.map(gt => 
          Array.isArray(gt.metadata.labelling) && gt.metadata.labelling.length > 0 ? gt.metadata.labelling : [t('no_labelling')]
        ).flat(1)
      )
    ]
    .sort()
    .map(value => ({ value, label: value }))
})
const selectedLabelling = ref<DropdownOption[]>([])

const scriptTypeOptions = computed(() => {
  return [
    ...new Set(workflowsStore.gt.map(gt => 
      gt.metadata["script-type"]
    ))
  ]
  .sort()
  .map(value => ({ value, label: value }))
})
const selectedScriptTypes = ref<DropdownOption[]>([])

const onLabellingChange = (event: any) => {
  selectedLabelling.value = event
  selectGTs()
}

const onScriptTypeChange = (event: any) => {
  selectedScriptTypes.value = event
  selectGTs()
}

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
    return (
      hasSomeSelectedLabelling(gt) && 
      hasSomeSelectedScriptType(gt) && 
      hasSomeSelectedProcessor(gt) && 
      hasSomeSelectedDateRange(gt) && 
      hasSomeSelectedWorkflow(gt)
    )
  })
}

const selectWorkflows = () => {
  filtersStore.workflow = selectedWorkflows.value.filter(({ value }) => (workflowhasSomeSelectedWorkflowStep(value)))
}
const hasSomeSelectedLabelling = (gt: GroundTruth) => {
  return selectedLabelling.value.some(({ value }) => {
    if(!Array.isArray(gt.metadata.labelling) || gt.metadata.labelling.length <= 0) return value === t('no_labelling')
    return gt.metadata.labelling?.some(labelling => labelling === value)
  })
}

const hasSomeSelectedScriptType = (gt: GroundTruth) => {
  return selectedScriptTypes.value.some(({ value }) => value === gt.metadata["script-type"])
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

watch(() => filtersStore.gt, () => {
  selectGTs()
})

onMounted(() => {
  workflowStepOptions.value = deduplicateStepIds(workflowsStore.workflows).map(id => ({ value: id, label: t(id) }))
  
  selectedDateRange.value = dateRangeOptions.value
  selectedWorkflows.value = workflowOptions.value
  selectedWorkflowSteps.value = workflowStepOptions.value
  selectedLabelling.value = labellingOptions.value
  selectedScriptTypes.value = scriptTypeOptions.value

  selectGTs()
  selectWorkflows()
})
</script>

<template>
<div class="pb-4 lg:pb-6 grid sm:grid-cols-2 gap-4 xl:grid-cols-5 xl:gap-8">
  <BaseMultiSelect
    v-model="selectedLabelling"
    @update:model-value="onLabellingChange($event)"
    filter
    :max-selected-labels="0"
    :options="labellingOptions"
    :placeholder="t('select_a_label')"
    :all-selected-label="t('filter_by_labelling')"
  />
  <BaseMultiSelect
    v-model="selectedScriptTypes"
    @update:model-value="onScriptTypeChange($event)"
    :max-selected-labels="0"
    :options="scriptTypeOptions"
    :placeholder="t('select_a_script_type')"
    :all-selected-label="t('filter_by_script_type')"
  />
  <BaseMultiSelect
    v-model="selectedDateRange"
    @update:model-value="onDateRangeChange($event)"
    :max-selected-labels="1"
    :options="dateRangeOptions"
    :placeholder="t('select_a_date_range')"
    :all-selected-label="t('filter_by_date_range')"
  />
  <BaseMultiSelect
    v-model="selectedWorkflows"
    @update:model-value="onWorkflowChange($event)"
    :max-selected-labels="1"
    :options="workflowOptions"
    :placeholder="t('select_a_workflow')"
    :all-selected-label="t('filter_by_workflow')"
  />
  <BaseMultiSelect
    v-model="selectedWorkflowSteps"
    @update:model-value="onWorkflowStepChange($event)"
    filter
    :max-selected-labels="1"
    :options="workflowStepOptions"
    :placeholder="t('select_a_processor')"
    :all-selected-label="t('filter_by_processor')"
  />
</div>

</template>