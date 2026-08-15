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
