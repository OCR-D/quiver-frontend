<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { createReadableMetricValue, getEvalColor, mapGtId } from "@/helpers/utils"
import type { EvalDefinitions, EvaluationResultsDocumentWide, EvaluationRun, GroupedTableData } from "@/types"
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import workflowsStore from "@/store/workflows-store"
import api from "@/helpers/api"
import filtersStore from "@/store/filters-store"
import TrendLegend from "@/components/workflows/TrendLegend.vue"
import { Icon } from '@iconify/vue'
import WorkflowsTableSorter from "@/components/workflows/timeline/WorkflowTableSorter.vue"

const { t } = useI18n()

const groupedData = ref<GroupedTableData>({})
const sortedData = ref<GroupedTableData>({})
const evals = ref<string[]>([])
const sortBy = ref<keyof EvaluationResultsDocumentWide | null>(null)

const tableData = computed<GroupedTableData>(() => {
  return (sortBy.value === null || Object.keys(sortedData.value).length === 0) ? groupedData.value : sortedData.value
})

const keepGroupsWhenSorting = ref(true)

const groupingOptions = ref([{
  value: 'documents',
  label: t('documents')
}, {
  value: 'workflows',
  label: t('workflows')
}])

const groupBy = ref(groupingOptions.value[0])
const latestRuns = ref<EvaluationRun[]>([])
const filteredRuns = ref<EvaluationRun[]>([])
const evalDefinitions = ref<EvalDefinitions>({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  latestRuns.value = workflowsStore.getLatestRuns()
  evalDefinitions.value = await api.getEvalDefinitions()
  setFilteredRuns()
  groupRuns(groupBy.value.value)
  loading.value = false
})

watch(() => filtersStore.gt, () => {
  setFilteredRuns()
  groupRuns(groupBy.value.value)
})

watch(groupBy, () => {
  groupRuns(groupBy.value.value)
})

function setFilteredRuns() {
  filteredRuns.value = latestRuns.value.filter(({ metadata }) => filtersStore.gt.findIndex(({ value }) => value === mapGtId(metadata.gt_workspace.id)) > -1)
}

function groupRuns(groupBy: string) {
  if (groupBy === 'workflows') groupByWorkflows()
  else if (groupBy === 'documents') groupByDocuments()
  sortBy.value = null
}

const groupByWorkflows = () => {
  groupedData.value = filteredRuns.value.filter(item => !!(item.metadata.ocr_workflow)).reduce((acc, cur) => {
    const ocrWorkflowId = mapGtId(cur.metadata.ocr_workflow['id'])
    const label = workflowsStore.getWorkflowById(ocrWorkflowId)?.label

    evals.value = Object.keys(cur.evaluation_results.document_wide)

    const subject = {
      label: workflowsStore.getGtById(mapGtId(cur.metadata.gt_workspace.id))?.label,
      evaluations: Object.keys(cur.evaluation_results.document_wide).map(key => ({
        name: key,
        value: cur.evaluation_results.document_wide[key as keyof EvaluationResultsDocumentWide]
      }))
    }
    if (!acc[ocrWorkflowId]) {
      acc[ocrWorkflowId] = {
        label,
        subjects: [subject]
      }
    } else {
      acc[ocrWorkflowId].subjects.push(subject)
      acc[ocrWorkflowId].subjects.sort((a, b) => {
        if ((a.label && b.label) && a.label > b.label) return 1
        else return -1
      })
    }
    return acc
  }, {} as GroupedTableData)
}

const groupByDocuments = () => {
  groupedData.value = filteredRuns.value.filter(item => !!(item.metadata.gt_workspace)).reduce((acc, cur) => {
    const gtWorkspaceId = mapGtId(cur.metadata.gt_workspace['id'])
    const label = workflowsStore.getGtById(gtWorkspaceId)?.label
    evals.value = Object.keys(cur.evaluation_results.document_wide)
    const subject = {
      label: workflowsStore.getWorkflowById(mapGtId(cur.metadata.ocr_workflow['id']))?.label,
      evaluations: Object.keys(cur.evaluation_results.document_wide).map(key => ({
        name: key,
        value: cur.evaluation_results.document_wide[key as keyof EvaluationResultsDocumentWide]
      }))
    }
    if (!acc[gtWorkspaceId]) {
      acc[gtWorkspaceId] = {
        label,
        subjects: [subject]
      }
    } else {
      acc[gtWorkspaceId].subjects.push(subject)
      acc[gtWorkspaceId].subjects.sort((a, b) => {
        if ((a.label && b.label) && a.label > b.label) return 1
        else return -1
      })
    }
    return acc
  }, {} as GroupedTableData)
}

const getSortValue = (key: keyof EvaluationResultsDocumentWide) => {
  return sortBy.value === key
}

const setSorted = (event: GroupedTableData, key: keyof EvaluationResultsDocumentWide) => {
  sortBy.value = key
  sortedData.value = event
}
</script>

<template>
  <template v-if="loading">
    Loading...
  </template>
  <template v-else>
    <div class="flex flex-col" v-if="Object.keys(tableData).length > 0">
      <div class="flex items-center mb-4 ml-auto">
        <label for="keepGroupsCheckbox" class="mr-2">{{ $t('keep_grouping_when_sorting') }}</label>
        <Checkbox v-model="keepGroupsWhenSorting" input-id="keepGroupsCheckbox" binary class="mr-8"></Checkbox>
        
        <p class="mr-2">{{ $t('group_by') }}:</p>
        <Dropdown v-model="groupBy" :options="groupingOptions" optionLabel="label" placeholder="Choose something.." class="" />
      </div>
      <TrendLegend :show-text-colors="false" class="ml-auto mb-4"/>
    </div>
    <table v-if="Object.keys(tableData).length > 0" class="w-full border border-collapse rounded text-sm">
      <thead>
      <tr>
        <th class="p-2 border">{{ groupBy.value === 'documents' ? $t('documents') : $t('workflows') }}</th>
        <th class="p-2 border">{{ groupBy.value === 'documents' ? $t('workflows') : $t('documents') }}</th>
        <th v-for="(evalKey, i) in evals" :key="i" class="p-2 border">
          <span class="def-label flex items-center justify-center cursor-pointer">
            <WorkflowsTableSorter 
              :grouped-data="groupedData" 
              :metric="(evalKey as keyof EvaluationResultsDocumentWide)" 
              :sort="getSortValue(evalKey as keyof EvaluationResultsDocumentWide)"
              :keep-grouping="keepGroupsWhenSorting"
              @sorted-data="setSorted($event, evalKey as keyof EvaluationResultsDocumentWide)"
              @unsorted-data="sortBy = null"
            >
              {{ evalDefinitions[evalKey] ? evalDefinitions[evalKey].label : evalKey }}
            </WorkflowsTableSorter>
            <div class="def-tooltip">
              <div class="flex p-2 bg-white border rounded space-x-2 items-start">
                <span>{{ evalDefinitions[evalKey] ? evalDefinitions[evalKey].short_descr : $t('no_description') }}.</span>
                <a v-if="evalDefinitions[evalKey]" :href="evalDefinitions[evalKey].url" class="flex items-center text-xs">
                  <Icon icon="material-symbols:info-outline" class="mr-1"></Icon>
                  <span>{{ $t('details') }}</span>
                </a>
              </div>
            </div>
          </span>
        </th>
      </tr>
      </thead>
      <tbody>
      <template v-for="(key, i) in Object.keys(tableData)" :key="i">
        <tr v-for="(subject, j) in tableData[key].subjects" :key="j">
          <td v-if="j === 0" :rowspan="tableData[key].subjects.length" class="align-top pl-2 border w-1/3">
            <span class="font-bold">{{ tableData[key].label }}</span>
          </td>
          <td class="align-top pl-2 border">{{ subject.label }}</td>
          <td
            v-for="({ name, value }, k) in subject.evaluations"
            :key="k"
            class="text-center pt-1 border"
            :class="(j === tableData[key].subjects.length - 1) ? 'pb-5' : 'pb-1'"
          >
            <span
              class="metric inline-block cursor-pointer text-sm leading-none p-1 rounded-lg min-w-[48px]"
              :class="getEvalColor(name, value)">
              {{ createReadableMetricValue(name as keyof EvaluationResultsDocumentWide, value) }}
            </span>
          </td>
        </tr>
      </template>
      </tbody>
    </table>
    <div v-else class="mt-12 mb-6">{{ $t('no_documents_selected') }}</div>
  </template>
</template>

<style scoped lang="scss">

.def-label {
  position: relative;

  &:hover {
    .def-tooltip {
      visibility: visible;
    }
  }
}

.def-tooltip {
  visibility: hidden;
  position: absolute;
  top: 0;
  transform: translateY(-100%);
  width: 300px;
  z-index: 100;
  padding-bottom: 10px;

  .card {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
  }
}

th, th span {
  font-weight: bold;
}
</style>
