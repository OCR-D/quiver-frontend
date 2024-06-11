<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  page: "timeline" | "table"
}>()
</script>
<template>
  <div class="text-base font-light">
    <p>{{ t('workflows_intro_text') }}</p>
    <p v-if="page==='timeline'">{{ t('workflows_intro_additional_text_timeline') }}</p>
    <br>
    <i18n-t
      keypath="workflows_intro_additional_infos"
      tag="p"
      scope="global"
    >
      <template v-slot:ocrd_link>
        <a :href="t('ocrd_link')" class="underline hover:text-primary">{{ t("ocrd_link") }}</a>
      </template>
    </i18n-t>
    <i18n-t
      keypath="workflows_intro_gt_guidelines"
      tag="p"
      scope="global"
    >
      <template v-slot:gt_guidelines_link>
        <a :href="t('gt_guidelines_link')" class="underline hover:text-primary">{{ t("gt_guidelines_link") }}</a>
      </template>
    </i18n-t>
  </div>
</template>
