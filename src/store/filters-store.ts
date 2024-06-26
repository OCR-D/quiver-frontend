import { reactive } from "vue"
import type { FilterOption } from "@/types"

export default reactive<{
  gt: FilterOption[],
  gtTimeline: FilterOption[],
  metric: FilterOption[],
  workflow: FilterOption[],
}>({
  gt: [],
  gtTimeline: [],
  metric: [],
  workflow: []
})
