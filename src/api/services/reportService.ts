import type { DetailedReport, ReportDetailResponse, ReportListResponse, ReportSummaryResponse } from '../../profile/types/report'
import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'

const reportPath = (reportId: number) =>
  API_ENDPOINTS.reports.detail.replace(':id', encodeURIComponent(String(reportId)))

const toSummary = (report: ReportSummaryResponse): DetailedReport => ({
  id: report.id,
  title: report.title,
  createdAt: report.analyzedAt.slice(0, 10),
  githubStacks: [],
  resumeStacks: [],
  overallScore: report.totalScore,
  summary: report.summary,
  categories: [],
})

const toDetailedReport = (report: ReportDetailResponse): DetailedReport | null => {
  if (report.id === null || report.status !== 'COMPLETED' || !report.title || !report.analyzedAt) {
    return null
  }

  return {
    id: report.id,
    title: report.title,
    createdAt: report.analyzedAt.slice(0, 10),
    githubStacks: report.stacks.filter((stack) => stack.foundInGithub).map((stack) => stack.name),
    resumeStacks: report.stacks.filter((stack) => stack.foundInPortfolio).map((stack) => stack.name),
    overallScore: report.totalScore,
    summary: report.summary ?? '',
    categories: report.categories.map((category) => ({
      name: category.name,
      score: category.score,
      description: category.description,
      interpretation: category.interpretation,
      detailStacks: category.stacks.map((stack) => stack.startsWith('#') ? stack : `#${stack.replace(/\s+/g, '-')}`),
    })),
  }
}

export const getMyReports = (): Promise<DetailedReport[]> =>
  httpClient<ReportListResponse>(API_ENDPOINTS.reports.myReports)
    .then((response) => response.reports.map(toSummary))

export const getLatestDetailedReport = (): Promise<DetailedReport | null> =>
  httpClient<ReportListResponse>(API_ENDPOINTS.reports.myReports)
    .then((response) => response.reports[0]?.id ?? null)
    .then((reportId) => reportId === null ? null : getDetailedReport(reportId))

export const getDetailedReport = (reportId: number): Promise<DetailedReport | null> =>
  httpClient<ReportDetailResponse>(reportPath(reportId)).then(toDetailedReport)
