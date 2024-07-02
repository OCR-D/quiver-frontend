import { reactive } from "vue"
import type { EvaluationRun, GroundTruth, ReleaseInfo, Workflow } from "@/types"
import { mapGtId } from "@/helpers/utils"

function normalizeDate(dateString: string): string {
  return new Date(new Date(dateString).setHours(0, 0, 0, 0)).toDateString()
}

export default reactive<{
  gt: GroundTruth[],
  workflows: Workflow[],
  runs: EvaluationRun[],
  latestRuns: EvaluationRun[],
  releases: ReleaseInfo[],
  getRuns: (gtId: string, workflowId?: string) => EvaluationRun[]
  getLatestRuns: () => EvaluationRun[],
  getGtById: (id: string) => GroundTruth | null
  getWorkflowById: (id: string) => Workflow | null
}>({
  gt: [],
  workflows: [],
  runs: [],
  latestRuns: [],
  releases: [],
  getRuns(gtId: string, workflowId?: string) {
    return this.runs
      .filter(
        ({ metadata }) => {
          const matchGt = mapGtId(metadata.gt_workspace.id) === gtId
          const matchWorkflow =  mapGtId(metadata.ocr_workflow.id) === workflowId

          return matchGt && (workflowId ? matchWorkflow : true)
        }
      )
  },
  getLatestRuns() {
    return this.latestRuns
  },
  getGtById(id: string): GroundTruth | null {
    return this.gt.find((item) => item.id === id) ?? null
  },
  getWorkflowById(id: string): Workflow | null {
    return this.workflows.find((item) => item.id === id) ?? null
  }
})
