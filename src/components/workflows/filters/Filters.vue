<script setup lang="ts">
import filtersStore from "@/store/filters-store"
import workflowsStore from "@/store/workflows-store"
import { computed, onMounted } from "vue"
import MultiSelect from "primevue/multiselect"
import type { FilterOption } from "@/types"

const gtOptions = computed(() => workflowsStore.gt.map(({ id, label }) => ({ value: id, label })))

onMounted(() => {
  filtersStore.gt = gtOptions.value
})
</script>

<template>
  <div class="flex flex-col items-start md:flex-row md:items-center">
    <p class="font-semibold mb-2 md:mb-0 md:mr-4">{{ $t('documents')}} ({{ $t('ground_truth')}}):</p>
    <MultiSelect
        :model-value="filtersStore.gt"
        @update:model-value="filtersStore.gt = $event"
        :options="gtOptions"
        optionLabel="label"
        placeholder="Select Ground Truth"
        panel-class="max-w-[500px]"
        :max-selected-labels="1"
        filter
        class="relative flex-1"
    >
      <template #option="{ option }: { option: FilterOption }">
        <span class="truncate">{{ option.label }}</span>
      </template>
    </MultiSelect>
  </div>

</template>

<style scoped lang="scss">

</style>
