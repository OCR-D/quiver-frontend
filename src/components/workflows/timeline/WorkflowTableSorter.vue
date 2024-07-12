<script setup lang="ts">
import Button from "primevue/button"
import { Icon } from "@iconify/vue"
import { ref, watch } from "vue"
import type { GroupedTableData, EvaluationResultsDocumentWide } from "@/types";
const props = withDefaults(
  defineProps<{
    groupedData: GroupedTableData
    metric: keyof EvaluationResultsDocumentWide
    sort?: boolean
  }>(), 
  {
    sort: false
  }
)
//const emit = defineEmits() //emit the sorted data

enum sortStates {
  none,
  desc,
  asc,
}
const sortState = ref(sortStates.none)

//watch sort -> set sortState none 

//watch props -> if changes and sortState not none -> resort

const cycleAndSort = () => {
  cycleSortState()
  sort()
}
const sort = () => {
  if (sortState.value === sortStates.none) return //prob need to emit smth so that data wont be sorted -> or just emit unsorted data
  //const sortedData = props.groupedData.sort((left, right)) hmmm need a way to sort an object
}

const cycleSortState = () => {
  sortState.value = (sortState.value + 1) % 3 //three sorting states
  console.log(sortState.value)
}

</script>
<template>
  <Button @click="cycleAndSort()" unstyled>
    <slot/>
    <Icon v-if="sortState === sortStates.desc" icon="typcn:arrow-sorted-down" class="ml-2"/>
    <Icon v-else-if="sortState === sortStates.asc" icon="typcn:arrow-sorted-up" class="ml-2"/>
    <Icon v-else icon="typcn:arrow-unsorted"></Icon>
  </Button>
</template>