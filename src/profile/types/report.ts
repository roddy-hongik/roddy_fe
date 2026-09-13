export type ReportCategory = {
  name: string
  score: number
  description: string
  interpretation: string
  detailStacks: string[]
}

export type DetailedReport = {
  id: number
  title: string
  createdAt: string
  githubStacks: string[]
  resumeStacks: string[]
  overallScore: number
  summary: string
  categories: ReportCategory[]
}

export type ReportSummaryResponse = {
  id: number
  desiredJob: string | null
  title: string
  totalScore: number
  summary: string
  analyzedAt: string
}

export type ReportListResponse = {
  reports: ReportSummaryResponse[]
}

export type ReportDetailResponse = {
  id: number | null
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | null
  desiredJob: string | null
  title: string | null
  totalScore: number
  summary: string | null
  githubAnalysis: string | null
  portfolioAnalysis: string | null
  failureReason: string | null
  analyzedAt: string | null
  categories: Array<{
    code: string
    name: string
    description: string
    score: number
    interpretation: string
    stacks: string[]
  }>
  stacks: Array<{
    name: string
    score: number
    level: string | null
    description: string
    category: string | null
    foundInGithub: boolean
    foundInPortfolio: boolean
  }>
}
