export type JobMatchingInsight = {
  stack: string
  userScore: number
  requiredScore: number
  note: string
}

export type JobPostingMatch = {
  jobId: string
  matchRate: number
  matchingInsights: JobMatchingInsight[]
}
