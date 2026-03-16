export type AnalysisSummary = {
  currentSkills: string[]
  gapSkills: string[]
  targetJob: string
  targetCompany: string
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

export type SaveRoadmapResult = {
  saved: boolean
  roadmap: SavedRoadmap
  reason?: 'duplicate'
}
