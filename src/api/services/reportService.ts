import { mockReports } from '../../profile/data/mockReports'
import type { DetailedReport } from '../../profile/types/report'

export async function getMyReports(): Promise<DetailedReport[]> {
  return Promise.resolve(mockReports)
}

export async function getLatestDetailedReport(): Promise<DetailedReport | null> {
  return Promise.resolve(mockReports[0] ?? null)
}

export async function getDetailedReport(reportId: number): Promise<DetailedReport | null> {
  const report = mockReports.find((item) => item.id === reportId) ?? null
  return Promise.resolve(report)
}
