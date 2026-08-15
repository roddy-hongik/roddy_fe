import { jobPostings } from '../../jobs/data/jobPostings'
import type { JobPostingMatch } from '../../jobs/types/jobMatching'

// Intentional mock domain: jobs backend API is not implemented yet.

export async function getJobPostingMatch(jobId: string): Promise<JobPostingMatch> {
  const matchedJob = jobPostings.find((job) => job.id === jobId)
  const matchingInsights = (matchedJob?.techStacks ?? ['협의 필요']).slice(0, 3).map((stack, index) => ({
    stack,
    userScore: Math.max(55, 78 - index * 8),
    requiredScore: 80,
    note: `${stack} 역량은 실제 API 연동 전까지 mock 기준으로 계산됩니다.`,
  }))

  return Promise.resolve({
    jobId,
    matchRate: matchingInsights.length > 0 ? Math.round(matchingInsights.reduce((sum, item) => sum + item.userScore, 0) / matchingInsights.length) : 0,
    matchingInsights,
  })
}
