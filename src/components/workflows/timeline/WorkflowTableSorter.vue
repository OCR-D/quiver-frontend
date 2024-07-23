<script setup lang="ts">
import Button from "primevue/button"
import { Icon } from "@iconify/vue"
import { ref, watch } from "vue"
import type { GroupedTableData, EvaluationResultsDocumentWide, GroupedTableDataSubject } from "@/types"
const props = withDefaults(
  defineProps<{
    groupedData: GroupedTableData
    metric: keyof EvaluationResultsDocumentWide
    sort?: boolean
    keepGrouping?: boolean
  }>(), 
  {
    sort: false,
    keepGrouping: true
  }
)
const emit = defineEmits<{
  (event: 'sortedData', payload: GroupedTableData): void,
  (event: 'unsortedData'): void
}>()

type GroupedEntry = [string, GroupedTableData[keyof GroupedTableData]]

enum sortStates {
  none,
  desc,
  asc,
  __LENGTH
}
const sortState = ref(sortStates.none)

//set sortState to none if sort changes to false to enable sorting by only a single column at a time 
watch(() => props.sort, () => {
  if(!props.sort) sortState.value = sortStates.none
}) 

watch(() => props.keepGrouping, () => {
  if(sortState.value !== sortStates.none) sort()
})

const cycleAndSort = () => {
  cycleSortState()
  sort()
}

const cycleSortState = () => {
  sortState.value = (sortState.value + 1) % sortStates.__LENGTH
}

const sort = () => {
  if (sortState.value === sortStates.none) {
    emit('unsortedData')
    return
  }
  const groupedEntries = Object.entries(props.groupedData)
  const entries = props.keepGrouping ? groupedEntries : transformToSingleSubjectGrouping(groupedEntries)
  const entriesWithSortedSubjects = entries.map(elem => {
    const sorted: typeof elem[1] = { label: elem[1].label, subjects: sortSubjects(elem[1].subjects, sortState.value === sortStates.desc) }
    return [elem[0], sorted]
  })
  const sortedData: GroupedTableData = Object.fromEntries(
    entriesWithSortedSubjects
    .sort((left, right) => {
      const leftData = left[1] as GroupedTableData[keyof GroupedTableData]
      const rightData = right[1] as GroupedTableData[keyof GroupedTableData]

      const compareByFirstSubject = (subjectsLeft: GroupedTableDataSubject[], subjectsRight: GroupedTableDataSubject[]) => {
        return compareSubjects(subjectsLeft[0], subjectsRight[0])
      }

      return sortState.value === sortStates.desc ? 
        compareByFirstSubject(rightData.subjects, leftData.subjects) 
      : compareByFirstSubject(leftData.subjects, rightData.subjects) 
    })
  )
  emit('sortedData', sortedData)
}

const sortSubjects = (subjects: GroupedTableDataSubject[], desc: boolean) => {
  return [...subjects] //copy to avoid sorting in place
  .sort((left: GroupedTableDataSubject, right: GroupedTableDataSubject) => {
    return desc ? compareSubjects(right, left) : compareSubjects(left, right)
  })
}

const compareSubjects = (left: GroupedTableDataSubject, right: GroupedTableDataSubject) => {
  const transformValue = (value: number | number [] | null | undefined): number => {
    const definedValue = value ?? 0
    return Array.isArray(definedValue) ? definedValue[0] : definedValue
  }
  const evaluationLeft = left.evaluations.find(elem => props.metric === elem.name)
  const evaluationRight = right.evaluations.find(elem => props.metric === elem.name)
  const valueLeft = transformValue(evaluationLeft?.value)
  const valueRight = transformValue(evaluationRight?.value)
  return valueLeft - valueRight
}

const transformToSingleSubjectGrouping = (groupedEntries: GroupedEntry[]): GroupedEntry[] => {
  return groupedEntries.reduce((acc, curr) => {
    curr[1].subjects.forEach((subject, index) => {
      acc.push([`${curr[0]}_${index}`, { label: curr[1].label, subjects: [subject] }])
    })
    return acc
  }, [] as GroupedEntry[])
}

</script>
<template>
  <Button @click="cycleAndSort()" unstyled>
    <div class="flex items-center space-x-2">
      <slot/>
      <span class="flex h-6 w-6 justify-center items-center">
        <Icon v-if="sortState === sortStates.desc" icon="typcn:arrow-sorted-down"/>
        <Icon v-else-if="sortState === sortStates.asc" icon="typcn:arrow-sorted-up"/>
        <Icon v-else icon="typcn:arrow-unsorted"></Icon>
      </span>
    </div>
  </Button>
</template>