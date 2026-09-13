export type RadarMetric = {
  subject: string
  score: number
  fullMark: number
}

export type RadarCategoryDetail = {
  subject: string
  current: number
  target: number
  note: string
  relatedStacks: string[]
}

export type MatchRate = {
  percent: number
  targetRole: string
  targetCompany: string
}

export type JobPosting = {
  id: string
  company: string
  title: string
  location: string
  matchPercent: number
  techTags: string[]
}

export type DashboardData = {
  userName: string
  reportId: string | null
  matchRate: MatchRate
  techKeywords: string[]
  recommendedJobs: JobPosting[]
  radarMetrics: RadarMetric[]
  radarDetails: RadarCategoryDetail[]
}

export type DashboardSummaryResponse = {
  userName: string
  desiredJob: string | null
  desiredCompany: string | null
  reportId: number | null
  analyzedAt: string | null
  categories: Array<{
    code: string
    name: string
    description: string
    score: number
    interpretation: string
    stacks: string[]
  }>
  techKeywords: string[]
  bestMatchRate: number | null
  recommendedJobs: Array<{
    id: number
    company: string
    title: string
    location: string | null
    techStacks: string[]
    matchRate: number | null
  }>
}
