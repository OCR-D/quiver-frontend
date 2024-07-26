import workflowsStore from "@/store/workflows-store"
import type { EvaluationResultsDocumentWide, EvaluationRun, GroundTruth, TimeSpan } from "@/types"

const GTTimelineSortingOptions = {
  LABEL_ASC: 'label_asc',
  LABEL_DESC: 'label_desc',
  METRIC_DESC: 'metric_desc',
  METRIC_ASC: 'metric_asc',
  YEAR_ASC: 'year_asc',
  YEAR_DESC: 'year_desc'
}

function sortByOption(gtList: GroundTruth[], sortingOption: string, metric: keyof EvaluationResultsDocumentWide): GroundTruth[] {
  if (sortingOption === GTTimelineSortingOptions.METRIC_DESC) return sortByMetric(gtList, true, metric)
  if (sortingOption === GTTimelineSortingOptions.METRIC_ASC) return sortByMetric(gtList, false, metric)
  if (sortingOption === GTTimelineSortingOptions.LABEL_DESC) return sortByLabel(gtList, true)
  if (sortingOption === GTTimelineSortingOptions.LABEL_ASC) return sortByLabel(gtList, false)
  if (sortingOption === GTTimelineSortingOptions.YEAR_DESC) return sortByYear(gtList, true)
  if (sortingOption === GTTimelineSortingOptions.YEAR_ASC) return sortByYear(gtList, false)
  return gtList
}

function sortByMetric(gtList: GroundTruth[], desc: boolean, metric: keyof EvaluationResultsDocumentWide): GroundTruth[] {
  return gtList.sort((left, right) => {
    const compareMetric = (left: GroundTruth, right: GroundTruth) => {
      const leftRuns = workflowsStore.getLatestRuns(left.id)
      const rightRuns = workflowsStore.getLatestRuns(right.id)
      
      const getAverageValue = (runs: EvaluationRun[]) => {
        if (runs.length === 0) return 0
        return runs.reduce((acc, curr) => {
          const value = <number | null>curr.evaluation_results.document_wide[metric]
          return acc += value ?? 0
        }, 0) / runs.length
      }

      return getAverageValue(leftRuns) - getAverageValue(rightRuns)
    }
    return desc ? compareMetric(right, left) : compareMetric(left, right)
  })
}

function sortByLabel(gtList: GroundTruth[], desc: boolean): GroundTruth[] {
  return gtList.sort((left, right) => { 
    const leftLabel = left.label.toLocaleLowerCase()
    const rightLabel = right.label.toLocaleLowerCase()
    return desc ? rightLabel.localeCompare(leftLabel) : leftLabel.localeCompare(rightLabel) 
  })
}

function sortByYear(gtList: GroundTruth[], desc: boolean): GroundTruth[] {
  return gtList.sort((left, right) => {
    const compareTimeSpan = (leftTime: TimeSpan, rightTime: TimeSpan) => {
      return (leftTime.notBefore > rightTime.notBefore) ? 1 : ((rightTime.notBefore > leftTime.notBefore) ? -1 : 0)
    }
    return desc ? compareTimeSpan(right.metadata.time, left.metadata.time) : compareTimeSpan(left.metadata.time, right.metadata.time)
  })
}



export {
  GTTimelineSortingOptions, sortByOption
}