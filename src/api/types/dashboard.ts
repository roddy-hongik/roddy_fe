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
  id: number
  company: string
  title: string
  location: string
  matchPercent: number
  techTags: string[]
  applyUrl: string
}

export type DashboardData = {
  userName: string
  matchRate: MatchRate
  techKeywords: string[]
  recommendedJobs: JobPosting[]
  radarMetrics: RadarMetric[]
  radarDetails: RadarCategoryDetail[]
}
