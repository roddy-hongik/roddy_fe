export type AnalysisSummary = {
  currentSkills: string[]
  gapSkills: string[]
  targetJob: string
  targetCompany: string | null
}

export type RoadmapStage = '기초' | '심화' | '실전 프로젝트'

export type RoadmapStep = {
  stage: RoadmapStage
  goal: string
  topics: string[]
  outputs: string[]
}

export type GeneratedRoadmap = {
  title: string
  steps: RoadmapStep[]
  currentSkills: string[]
  gapSkills: string[]
  targetJob: string
  targetCompany: string
}

export type SavedRoadmap = {
  id: string
  createdAt: string
  roadmapTitle: string
  targetJob: string
  targetCompany: string
  currentSkills: string[]
  gapSkills: string[]
  roadmapSteps: RoadmapStep[]
}

/** 저장한 로드맵 한 페이지. 최신순이고 page 는 0부터 센다. */
export type SavedRoadmapPage = {
  roadmaps: SavedRoadmap[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type SaveRoadmapResult = {
  saved: boolean
  roadmap: SavedRoadmap
  reason?: 'duplicate'
}
