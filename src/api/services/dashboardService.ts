import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { DashboardData, DashboardSummaryResponse } from '../types/dashboard'
import { toDesiredJobLabel } from '../../shared/utils/careerLabels'

const toDashboardData = (response: DashboardSummaryResponse): DashboardData => ({
  userName: response.userName,
  reportId: response.reportId === null ? null : String(response.reportId),
  matchRate: {
    percent: response.bestMatchRate ?? 0,
    targetRole: response.desiredJob ? toDesiredJobLabel(response.desiredJob) : '희망 직무 미설정',
    targetCompany: response.desiredCompany ?? '희망 기업 미설정',
  },
  techKeywords: response.techKeywords.map((keyword) =>
    keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '-')}`),
  recommendedJobs: response.recommendedJobs.map((job) => ({
    id: String(job.id),
    company: job.company,
    title: job.title,
    location: job.location ?? '-',
    matchPercent: job.matchRate ?? 0,
    techTags: job.techStacks,
  })),
  radarMetrics: response.categories.map((category) => ({
    subject: category.name,
    score: category.score,
    fullMark: 100,
  })),
  radarDetails: response.categories.map((category) => ({
    subject: category.name,
    current: category.score,
    target: 100,
    note: category.interpretation || category.description,
    relatedStacks: category.stacks,
  })),
})

export const getDashboardData = (): Promise<DashboardData> =>
  httpClient<DashboardSummaryResponse>(API_ENDPOINTS.dashboard.summary).then(toDashboardData)
