<script setup lang="ts">
import OverlayPanel from "primevue/overlaypanel"
import Button from "primevue/button"
import { Icon } from "@iconify/vue"
import { OverlayPanelDropdownStyles } from "@/helpers/pt"
import { ref } from "vue"
import type { GroundTruth } from "@/types"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
  gtMetadata: GroundTruth["metadata"]
}>()

const opLabelling = ref()
const opVolume = ref()
const volumeMetadata = {
    label: t('volume'),
    data: Array.isArray(props.gtMetadata.volume) ? props.gtMetadata.volume.reduce((acc, curr) => ({ ...acc, [curr.metric]: curr.count }), {}) : props.gtMetadata.volume,
}

const metadata = [
  {
    label: t('language', props.gtMetadata.language.length),
    data: props.gtMetadata.language,
    isArray: true,
  },
  {
    label: t('script', props.gtMetadata.script.length),
    data: props.gtMetadata.script,
    isArray: true,
  },
  {
    label: t('script-type'),
    data: props.gtMetadata["script-type"],
  },
]

function toggleOpLabelling(event: any) {
  opLabelling.value?.toggle(event)
}

function toggleOpVolume(event: any) {
  opVolume.value?.toggle(event)
}

</script>
<template>
  <div class="flex flex-wrap md:grid md:grid-cols-3 md:space-x-0 md:gap-2 lg:flex lg:space-x-5 lg:flex-nowrap items-start text-sm text-slate-700">
    <div v-for="meta in metadata" :key="meta.label" class="mr-5 mb-5 md:mr-0 md:mb-0">
      <div class="flex flex-col">
        <span class="font-medium">{{ meta.label }}:</span>
        <span v-if="meta.isArray">{{ meta.data?.join(', ') }}</span>
        <span v-else>{{ meta.data }}</span>
      </div>
    </div>
    <Button @click="toggleOpLabelling"
            unstyled
            :pt="{
    root: 'text-sm mr-5 md:mr-0 flex items-center bg-gray-100 text-slate-700 p-2 hover:bg-gray-200 rounded hover:text-black focus:outline-none'
  }">
      <span>{{ $t('labelling') }}</span>
      <Icon v-if="opLabelling?.visible" icon="ic:baseline-close-fullscreen" class="ml-2"></Icon>
      <Icon v-else icon="ic:baseline-open-in-full" class="ml-2"></Icon>
    </Button>

    <Button @click="toggleOpVolume"
            unstyled
            :pt="{ root: 'text-sm flex items-center bg-gray-100 text-slate-700 p-2 hover:bg-gray-200 rounded hover:text-black focus:outline-none'}"
    >
      <span>{{ $t('volume') }}</span>
      <Icon v-if="opVolume?.visible" icon="ic:baseline-close-fullscreen" class="ml-2"></Icon>
      <Icon v-else icon="ic:baseline-open-in-full" class="ml-2"></Icon>
    </Button>
  </div>

  <OverlayPanel ref="opLabelling" unstyled :pt="OverlayPanelDropdownStyles">
    <template #container>
      <div v-if="gtMetadata.labelling?.length > 0" class="flex flex-col py-1 space-y-1 overflow-y-scroll max-w-[80vw] sm:max-w-[90vw] max-h-[300px]">
        <span v-for="label in gtMetadata.labelling.slice(0).sort()" :key="label" class="hover:bg-gray-200 rounded px-2 text-sm">
          {{ label }}
        </span>
      </div>
      <div v-else class="py-1 px-2">
        <span>{{ $t('no_labels_for_this_entry') }}</span>
      </div>
    </template>
  </OverlayPanel>
  <OverlayPanel ref="opVolume" unstyled :pt="OverlayPanelDropdownStyles">
    <template #container>
      <div class="flex space-x-2 p-4">
        <div v-for="(value, key) in volumeMetadata.data" :key="key">
          <div class="border-b-2 border-gray-300">{{ key }}</div>
          <div>{{ value }}</div>
        </div>
      </div>

    </template>
  </OverlayPanel>
</template>

<style scoped lang="scss">
.text-highlight:hover {
  color: var(--highlight-text-color);
}
</style>