import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type { DashboardData } from '../types/dashboard'
import { mockReports } from '../../profile/data/mockReports'
import { jobPostings } from '../../jobs/data/jobPostings'

const latestReport = mockReports[0]
const discoveredTechKeywords = Array.from(new Set([...(latestReport?.githubStacks ?? []), ...(latestReport?.resumeStacks ?? [])]))

const mockDashboardData: DashboardData = {
  userName: localStorage.getItem('userName') ?? '신애',
  matchRate: {
    percent: latestReport?.overallScore ?? 0,
    targetRole: 'Backend Engineer',
    targetCompany: 'Roddy 추천 기업군',
  },
  techKeywords: discoveredTechKeywords.map((keyword) => (keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '-')}`)),
  recommendedJobs: [
    {
      id: '2',
      company: 'CloudFrame',
      title: '프론트엔드 엔지니어 (UI Platform)',
      location: '서울 서초구',
      matchPercent: 91,
      techTags: ['React', 'TypeScript', 'Storybook'],
    },
    {
      id: '7',
      company: 'NovaPay',
      title: '프론트엔드 개발자 (결제 UI)',
      location: '서울 강서구',
      matchPercent: 89,
      techTags: ['React', 'TypeScript', 'Redux Toolkit'],
    },
    {
      id: '3',
      company: 'DataSpring',
      title: '그로스 프론트엔드 개발자',
      location: '원격/서울',
      matchPercent: 86,
      techTags: ['React', 'Next.js', 'Amplitude'],
    },
  ],
  radarMetrics: (latestReport?.categories ?? []).map((category) => ({
    subject: category.name,
    score: category.score,
    fullMark: 100,
  })),
  radarDetails: (latestReport?.categories ?? []).map((category) => ({
    subject: category.name,
    current: category.score,
    target: Math.min(category.score + 12, 100),
    note: category.interpretation,
    relatedStacks: category.detailStacks,
  })),
}

const recommendedJobsById = mockDashboardData.recommendedJobs.map((job) => {
  const matchedJob = jobPostings.find((posting) => posting.id === job.id)

  if (!matchedJob) {
    return job
  }

  return {
    id: matchedJob.id,
    company: matchedJob.company,
    title: matchedJob.title,
    location: matchedJob.location,
    matchPercent: matchedJob.matchRate,
    techTags: matchedJob.techStacks.slice(0, 3),
  }
})

mockDashboardData.recommendedJobs = recommendedJobsById

export async function getDashboardData(): Promise<DashboardData> {
  try {
    return await httpClient<DashboardData>(API_ENDPOINTS.dashboard.summary, {
      method: 'GET',
    })
  } catch {
    return mockDashboardData
  }
}
