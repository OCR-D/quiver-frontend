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

const metadata = [
  {
    label: t('url'),
    data: props.gtMetadata.title,
    href: props.gtMetadata.url,
    isLink: true,
  },
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
  {
    label: t('license', props.gtMetadata.license.length),
    data: props.gtMetadata.license,
    title: 'name',
    href: 'url',
    isLink: true,
    isArray: true,
  },
   {
    label: t('volume'),
    data: props.gtMetadata.volume,
    isDict: true,
   }
]

function toggleOpLabelling(event: any) {
  opLabelling.value?.toggle(event)
}

</script>
<template>
<div class="sm:grid sm:grid-cols-2 sm:gap-2 lg:grid-cols-3 flex flex-col overflow-x-auto text-sm text-slate-700">
  <div v-for="meta in metadata" :key="meta.label" :class="{'sm:col-span-2 lg:col-span-3': meta.isDict}">
    <div class="flex flex-wrap">
      <span class="mr-2 font-medium">{{ meta.label }}:</span>
      <div v-if="meta.isLink && meta.isArray">
        <a v-for="data in meta.data" :key="data.name" :href="data[meta.href as keyof typeof data]" target="_blank" class="flex items-center justify-start mr-2 text-highlight">
          <Icon icon="ci:external-link" class="mr-1"/>
          <span>{{ data[meta.title as keyof typeof data] }}</span>
        </a>
      </div>
      <a v-else-if="meta.isLink && !meta.isArray" :href="meta.href" target="_blank" class="flex items-center justify-start mr-2 text-highlight">
        <Icon icon="ci:external-link" class="mr-1"/>
        <span>{{ meta.data }}</span>
      </a>
      <span v-else-if="meta.isArray">{{ meta.data?.join(', ') }}</span>
      <div v-else-if="meta.isDict" class="flex flex-row space-x-2 px-2">
        <span v-for="(value, key) in meta.data" :key="key">
          <ul class="border-b-2 border-gray-300">
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
<Button @click="toggleOpLabelling" 
  unstyled
  :pt="{ 
  root: 'text-sm my-2 flex items-center bg-gray-100 text-slate-700 p-2 hover:bg-gray-200 rounded hover:text-black focus:outline-none'
}">
  <span>{{ $t('labelling') }}</span>
  <Icon v-if="opLabelling?.visible" icon="ic:baseline-close-fullscreen" class="ml-2"></Icon>
  <Icon v-else icon="ic:baseline-open-in-full" class="ml-2"></Icon>
</Button>
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
</template>

<style scoped lang="scss">
.text-highlight:hover {
  color: var(--highlight-text-color);
}
</style>