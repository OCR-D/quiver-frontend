<script setup lang="ts">
import Panel from "primevue/panel"
import OverlayPanel from 'primevue/overlaypanel'
import StepsAcronyms from '@/helpers/workflow-steps-acronyms'
import MetricChart from "@/components/workflows/timeline/MetricChart.vue"
import type { EvaluationResultsDocumentWide, GroundTruth, Workflow, WorkflowStep } from "@/types"
import MetricAverageChart from "@/components/workflows/timeline/MetricAverageChart.vue"
import { Icon } from '@iconify/vue'
import { computed, nextTick, ref } from "vue"
import { OverlayPanelDropdownStyles } from "@/helpers/pt"
import workflowsStore from "@/store/workflows-store"
import TimelineItemMetadata from "@/components/workflows/timeline/TimelineItemMetadata.vue"
import filtersStore from "@/store/filters-store"
import projectsStore from "@/store/projects-store"


defineProps<{
  gt: GroundTruth,
  metric: keyof EvaluationResultsDocumentWide
}>()

const op = ref<OverlayPanel>()
const isOpVisible = ref(false)
const selectedStep = ref<WorkflowStep | null>(null)
const selectedStepUrl = computed<string | null>(() => selectedStep.value ? getStepUrl(selectedStep.value) : null)
const selectedStepVersion = computed<string | null>(() => selectedStep.value ? getStepVersion(selectedStep.value) : null)
const startDate = ref<Date>(new Date('2023-10-01'))
const endDate = ref<Date>(new Date())

const workflows = computed<Workflow[]>(() => workflowsStore.workflows.filter(({ id }) => filtersStore.workflow.findIndex(({ value }) => value === id ) > - 1))

function getStepAcronym(stepId) {
  return StepsAcronyms[stepId]
}

function showParametersOverlay(step: WorkflowStep, event: Event) {
  selectedStep.value = step
  op.value?.show(event)
}

function hideParametersOverlay() {
  op.value?.hide()
}

function toggleParameterOverlay(step: WorkflowStep, event: Event) {
  if (isOpVisible.value) {
    hideParametersOverlay()
    if (selectedStep.value !== step) {
      nextTick(() => {
        showParametersOverlay(step, event)
      })
    }
  } else {
    showParametersOverlay(step, event)
  }
}

function getStepUrl(step: WorkflowStep) {
  const repo = projectsStore.repos.find(({ ocrd_tool }) => {
    return ocrd_tool?.tools[step.id]
  })
  return repo?.url ?? null
}

function getStepVersion(step: WorkflowStep) {
  const repo = projectsStore.repos.find(({ ocrd_tool }) => {
    return ocrd_tool?.tools[step.id]
  })
  return repo?.ocrd_tool?.version ?? null
}

</script>

<template>
  <Panel
    header="Header"
    toggleable
    :collapsed="true"
    unstyled
    :pt="{
      root: 'border border-gray-300 rounded-lg overflow-hidden',
      header: 'pt-4',
      content: '',
      icons: 'w-full flex',
      toggler: 'w-full flex justify-center bg-gray-50 text-gray-500 p-2 hover:bg-gray-100 rounded hover:text-gray-700 focus:outline-none'
    }"
  >
    <template v-slot:header>
      <div class="flex flex-col px-4 pb-2">
        <div class="flex items-center overflow-hidden">
          <h2 class="text-xl font-bold truncate mr-8" :title="gt.label">{{ gt.label }}</h2>
          <a :href="gt.metadata.url" class="text-gray-600 hover:text-gray-700 flex-shrink-0 ml-auto mr-2 flex items-center bg-gray-100 rounded-full py-1 px-2">
            <Icon icon="mdi:github" class="text-xl mr-1"/>
            <span class="text-xs">{{ gt.metadata.title }}</span>
          </a>
          <a :href="gt.metadata.license[0].url" class="text-gray-600 hover:text-gray-700 flex-shrink-0 flex items-center bg-gray-100 rounded-full py-1 px-2">
            <Icon icon="octicon:law" class="text-xl mr-1"/>
            <span class="text-xs">{{ gt.metadata.license[0].name }}</span>
          </a>
        </div>
        <div class="flex mt-6 md:flex-row flex-col">
          <div class="md:w-1/2 mb-5 md:mb-0">
            <TimelineItemMetadata :gtMetadata="gt.metadata"/>
          </div>
          <div class="md:w-1/2 flex flex-col overflow-x-auto md:items-end">
            <h3 class="font-bold pr-[240px] mb-2">{{$t('average_timeline')}}</h3>
            <MetricAverageChart
              :workflow-name="$t('average')"
              :gt-name="gt.label"
              :runs="workflowsStore.getRuns(gt.id)"
              :metric="metric"
              class=""
              :width="400"
              :start-date="startDate"
              :end-date="endDate"
          />
          </div>
        </div>

      </div>
    </template>
    <template v-slot:default>
      <div class="flex border-t border-gray-300 py-4 px-4">
        <table class="table-fixed w-full">
          <thead>
            <tr class="">
              <th class="text-left pb-4">{{ $t('workflows') }}</th>
              <th class="text-left pb-4">{{ $t('processors') }}</th>
              <th class="text-right pr-[314px] pb-4">{{ $t('timeline') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="workflow in workflows" :key="workflow.id">
            <td class="font-semibold pe-2">{{ workflow.label }}</td>
            <td class="p-1 overflow-x-auto">
              <span
                  v-for="step in workflow.steps"
                  :key="step.id"
                  class="p-1 cursor-pointer text-highlight"
                  @click="toggleParameterOverlay(step, $event)"
              >
              {{ getStepAcronym(step.id) }}
            </span>
            </td>
            <td class="overflow-x-auto">
              <MetricChart
                :runs="workflowsStore.getRuns(gt.id, workflow.id)"
                :gt-name="gt.label"
                :workflow-name="workflow.label"
                :metric="metric"
                :width="400"
                :start-date="startDate"
                :end-date="endDate"
                class="flex justify-end"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-slot:togglericon="{ collapsed }">
      <Icon :icon="collapsed ? 'bi:chevron-down' : 'bi:chevron-up'"/>
    </template>
  </Panel>
  <OverlayPanel
    ref="op"
    :pt="OverlayPanelDropdownStyles"
    @show="isOpVisible = true"
    @hide="isOpVisible = false"
  >
    <div class="flex flex-col pt-2">
      
      <a v-if="selectedStepUrl" class="font-bold px-2 pb-2 border-b border-gray-300 flex items-center hover:underline underline-offset-2" :href="selectedStepUrl" target="_blank">
        <Icon icon="mdi:github" class="text-2xl mr-1"/>
        <span class="">{{ selectedStep?.id }}</span>
      </a>
      <h2 v-else class="font-bold px-2 pb-2 border-b border-gray-300">{{ selectedStep?.id }}</h2>
      <div v-if="selectedStepVersion" class="px-2 mt-1 text-sm">Version: {{ selectedStepVersion }}</div>
      <div class="overflow-y-scroll max-h-[400px] w-full mt-2">
        <table v-if="selectedStep" class="text-sm border-collapse">
          <tr class="">
            <th class="p-1 pl-2 font-semibold">Parameter</th>
            <th class="p-1 pr-2 font-semibold">Value</th>
          </tr>
          <tr v-for="step in Object.keys(selectedStep.params)" :key="step">
            <td class="p-1 pl-2 border-collapse border border-l-0 border-b-0 border-gray-300">{{ step }}</td>
            <td class="p-1 pr-2 border-collapse border border-r-0 border-b-0 border-gray-300">{{ selectedStep.params[step] }}</td>
          </tr>
        </table>
      </div>
    </div>
  </OverlayPanel>
</template>

<style scoped lang="scss">
.text-highlight:hover {
  color: var(--highlight-text-color);
  background-color: var(--highlight-bg);
}
</style>
