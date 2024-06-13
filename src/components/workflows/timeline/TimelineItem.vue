<script setup lang="ts">
import Panel from "primevue/panel"
import OverlayPanel from 'primevue/overlaypanel'
import StepsAcronyms from '@/helpers/workflow-steps-acronyms'
import MetricChart from "@/components/workflows/timeline/MetricChart.vue"
import type { EvaluationResultsDocumentWide, GroundTruth, Workflow, WorkflowStep } from "@/types"
import MetricAverageChart from "@/components/workflows/timeline/MetricAverageChart.vue"
import { Icon } from '@iconify/vue'
import { onMounted, nextTick, ref } from "vue"
import { OverlayPanelDropdownStyles } from "@/helpers/pt"
import workflowsStore from "@/store/workflows-store"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
  gt: GroundTruth,
  metric: keyof EvaluationResultsDocumentWide
}>()

const op = ref<OverlayPanel>()
const opLabelling = ref()
const isOpVisible = ref(false)
const selectedStep = ref<WorkflowStep | null>(null)
const startDate = ref<Date>(new Date('2023-10-01'))
const endDate = ref<Date>(new Date())
const workflows = ref<Workflow[]>([])

const metadata = [
  {
    label: t('url'),
    data: props.gt.metadata.title,
    href: props.gt.metadata.url,
    isLink: true,
  },
  {
    label: t('language', props.gt.metadata.language.length),
    data: props.gt.metadata.language,
    isArray: true,
  },
  {
    label: t('script', props.gt.metadata.script.length),
    data: props.gt.metadata.script,
    isArray: true,
  },
  {
    label: t('script-type'),
    data: props.gt.metadata["script-type"],
  },
  {
    label: t('license', props.gt.metadata.license.length),
    data: props.gt.metadata.license,
    title: 'name',
    href: 'url',
    isLink: true,
    isArray: true,
  },
   {
    label: t('volume'),
    data: props.gt.metadata.volume,
    isDict: true,
   }
]

onMounted(() => {
  workflows.value = workflowsStore.workflows
})

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
function toggleOpLabelling(event: any) {
  opLabelling.value?.toggle(event)
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
      <div class="flex w-full px-4 pb-2 flex-wrap">
        <div class="w-1/2 flex">
          <h2 class="w-full flex-shrink-0 text-xl font-bold truncate" :title="gt.label">{{ gt.label }}</h2>
        </div>
        <div class="w-1/2 flex justify-end">
          <div class="flex overflow-x-auto">
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
        <div class="sm:grid sm:grid-cols-2 sm:gap-2 lg:grid-cols-3 flex flex-col w-full overflow-x-auto pt-2">
          <div v-for="meta in metadata" :key="meta.label" :class="{'sm:col-span-2 lg:col-span-3': meta.isDict}">
            <div class="flex flex-wrap">
              <span class="mr-2 font-semibold">{{ meta.label }}:</span>
              <div v-if="meta.isLink && meta.isArray">
                <a v-for="data in meta.data" :key="data.name" :href="data[meta.href as keyof typeof data]" class="flex items-center justify-start mr-2 text-highlight">
                  <Icon icon="ci:external-link" class="mr-1"/>
                  <span>{{ data[meta.title as keyof typeof data] }}</span>
                </a>
              </div>
              <a v-else-if="meta.isLink && !meta.isArray" :href="meta.href" class="flex items-center justify-start mr-2 text-highlight">
                <Icon icon="ci:external-link" class="mr-1"/>
                <span>{{ meta.data }}</span>
              </a>
              <span v-else-if="meta.isArray">{{ meta.data?.join(', ') }}</span>
              <div v-else-if="meta.isDict" class="flex flex-row space-x-2 px-2">
                <span v-for="(value, key) in meta.data" :key="key">
                  <ul class="border-b-2">
                    {{ key }}
                  </ul>
                  <ul>
                    {{ value }}
                  </ul>
                </span>
              </div>
              <span v-else>{{ meta.data }}</span>
            </div>
          </div>
        </div>
        <button class="font-semibold my-2 flex items-center text-highlight" @click="toggleOpLabelling">
          <span>{{ $t('labelling') }}</span>
          <Icon v-if="opLabelling?.visible" icon="ic:baseline-close-fullscreen" class="ml-2"></Icon>
          <Icon v-else icon="ic:baseline-open-in-full" class="ml-2"></Icon>
        </button>
        <OverlayPanel ref="opLabelling" unstyled :pt="OverlayPanelDropdownStyles">
          <template #container>
            <div v-if="gt.metadata.labelling?.length > 0" class="flex flex-col py-1 space-y-1 overflow-y-scroll max-w-[80vw] sm:max-w-[90vw] max-h-[300px]">
              <span v-for="label in gt.metadata.labelling.slice(0).sort()" :key="label" class="hover:bg-gray-200 rounded px-2">
                {{ label }}
              </span>
            </div>
            <div v-else class="py-1 px-2">
              <span>{{ $t('no_labels_for_this_entry') }}</span>
            </div>
          </template>
        </OverlayPanel>
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
      <h2 class="font-bold px-2 pb-2 mb-2 border-b border-gray-300">{{ selectedStep?.id }}</h2>
      <div class="overflow-y-scroll max-h-[400px] w-full">
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
}
</style>
