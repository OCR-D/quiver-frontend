export interface GroundTruth {
  id: string,
  label: string,
  metadata: GroundTruthMetadata
}

export interface GroundTruthMetadata {
  authors: {
    name: string,
    surname: string,
    roles: string[]
  }[],
  description: string,
  format: string,
  gtTyp: string,
  hands: {
    count: string,
    level: string
  },
  labelling: string[],
  language: string[],
  license: {
    name: string,
    url: string
  }[],
  'project-name': string,
  'project-website': string,
  schema: string,
  script: string[],
  'script-type': string,
  sources: {
    reference: string,
    link: string
  }[],
  time: {
    notBefore: string,
    notAfter: string
  },
  title: string,
  'transcription-guidelines': string,
  url: string,
  volume: {
    TxtRegion?: string,
    GraphRegion?: string,
    SepRegion?: string,
    MusicRegion?: string,
    NoiseRegion?: string,
    TextLine?: string,
    Page?: string,
  } |
  {
    metric: string,
    count: number,
  }[],
}

export interface Workflow {
  id: string,
  label: string,
  model: string,
  steps: WorkflowStep[]
}

export interface Workspace {
  id: string,
  label: string
}

export interface WorkflowStep {
  id: string,
  params: WorkflowStepParams
}

export interface WorkflowStepParams {
  [key: string]: number | string
}

export interface EvaluationRun {
  eval_workflow_id: string,
  evaluation_results: EvaluationResults,
  label: string,
  metadata: EvaluationRunMetadata
}

export interface EvaluationRunMetadata {
  document_metadata: DocumentMetadata,
  eval_tool: string,
  eval_workflow: Workflow,
  eval_workspace: Workspace,
  gt_workspace: Workspace,
  ocr_workflow: Workflow,
  ocr_workspace: Workspace,
  release_info: ReleaseInfo,
  timestamp: string,
  workflow_model: string,
  workflow_steps: WorkflowStep[]
}

export interface EvaluationResults {
  by_page: EvaluationResultsByPage,
  document_wide: EvaluationResultsDocumentWide
}

export interface EvaluationResultsByPage {
  page_id: string,
  cer: number,
  wer: number
}

export interface EvaluationResultsDocumentWide {
  cer_mean: number | null,
  cer_median: number | null,
  cer_range: number[] | null,
  cer: number | null,
  cer_standard_deviation: number | null,
  cpu_time: number | null,
  pages_per_minute: number | null,
  wall_time: number | null,
  wer: number | null,
}

export interface DropdownOption {
  value: string,
  label: string
}

export interface TimelineChartDataPoint {
  date: Date,
  value: number
}

export interface FilterOption {
  value: string,
  label: string
}

export interface Release {
  projects: string[],
  tag: string
}

export interface ReleaseInfo {
  id: number,
  published_at: string,
  tag_name: string,
  html_url: string
}

export interface EvalDefinitions {
  [id: string]: {
    label: string,
    short_descr: string,
    url: string 
  }
}

export interface GroupedTableData {
  [gtWorkId: string]: {
    label: string | undefined,
    subjects: GroupedTableDataSubject[]
  }
}


export interface GroupedTableDataSubject {
  label: string | undefined
  evaluations: {
    name: string
    value: number | number[] | null
  }[]
}

export interface Project {
  additional_info: {
    links: {
      Dockerfile?: string
      "README.md"?: string
      "ocrd-tool.json"?: string
      "setup.py"?: string
    }
  }
  compliant_cli: boolean
  dependencies: {
    [package: string]: string
  }
  dependency_conflicts?: {
    [package: string]: {
      [package: string]: string
    }
  }
  id: string
  latest_version: string
  ocrd_tool: {
    git_url: string
    tools: {
      [ocrd_tool: string]: {
        categrories: string[]
        description: string
        executable: string
        input_file_grp: string[]
        output_file_grp: string[]
        parameters: any
        steps: string[]
      }
    }
    version: string
  }
  ocrd_tool_json_valid: boolean
  official: boolean
  org_plus_name: string
  project_type: string
  unreleased_changes: number
  url: string
}