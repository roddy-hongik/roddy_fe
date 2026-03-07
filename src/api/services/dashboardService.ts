import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type { DashboardData } from '../types/dashboard'

const mockDashboardData: DashboardData = {
  userName: localStorage.getItem('userName') ?? '신애',
  matchRate: {
    percent: 82,
    targetRole: 'Frontend Engineer',
    targetCompany: 'Roddy 추천 기업군',
  },
  techKeywords: ['#TypeScript', '#React', '#Vite', '#CI/CD', '#TestCoverage', '#Performance'],
  recommendedJobs: [
    {
      id: 1,
      company: 'NovaByte',
      title: 'Frontend Developer',
      location: 'Seoul · Hybrid',
      matchPercent: 91,
      techTags: ['React', 'TypeScript', 'GraphQL'],
    },
    {
      id: 2,
      company: 'CloudFrame',
      title: 'UI Platform Engineer',
      location: 'Remote',
      matchPercent: 87,
      techTags: ['Design System', 'Next.js', 'Storybook'],
    },
    {
      id: 3,
      company: 'DataSpring',
      title: 'Frontend Growth Engineer',
      location: 'Seoul',
      matchPercent: 84,
      techTags: ['A/B Test', 'Analytics', 'React'],
    },
  ],
  radarMetrics: [
    { subject: 'Data Modeling', score: 72, fullMark: 100 },
    { subject: 'Architecture', score: 80, fullMark: 100 },
    { subject: 'Scalability', score: 77, fullMark: 100 },
    { subject: 'Stability', score: 84, fullMark: 100 },
    { subject: 'DevOps/CI·CD', score: 69, fullMark: 100 },
    { subject: 'Monitoring', score: 74, fullMark: 100 },
  ],
  radarDetails: [
    {
      subject: 'Data Modeling',
      current: 72,
      target: 86,
      note: '도메인 모델링은 안정적이며 API 스키마 정교화가 다음 과제입니다.',
      relatedStacks: ['ERD', 'Schema Design', 'API Contract'],
    },
    {
      subject: 'Architecture',
      current: 80,
      target: 90,
      note: '컴포넌트 경계와 상태 구조가 좋고 공용 모듈 추상화 개선 여지가 있습니다.',
      relatedStacks: ['Layered UI', 'State Management', 'Module Boundaries'],
    },
    {
      subject: 'Scalability',
      current: 77,
      target: 88,
      note: '트래픽 상승 대비 코드 스플리팅과 캐싱 전략 고도화가 필요합니다.',
      relatedStacks: ['Code Splitting', 'Caching', 'Virtualization'],
    },
    {
      subject: 'Stability',
      current: 84,
      target: 92,
      note: '에러 핸들링 패턴이 안정적이며 경계 테스트 확장이 추천됩니다.',
      relatedStacks: ['Error Boundary', 'Fallback UI', 'Integration Test'],
    },
    {
      subject: 'DevOps/CI·CD',
      current: 69,
      target: 84,
      note: '배포 자동화는 기본 수준이며 quality gate를 강화할 필요가 있습니다.',
      relatedStacks: ['GitHub Actions', 'Release Pipeline', 'Quality Gate'],
    },
    {
      subject: 'Monitoring',
      current: 74,
      target: 85,
      note: '핵심 지표 수집은 가능하며 사용자 여정 기반 관측 설계를 권장합니다.',
      relatedStacks: ['Sentry', 'RUM', 'Dashboarding'],
    },
  ],
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    return await httpClient<DashboardData>(API_ENDPOINTS.dashboard.summary, {
      method: 'GET',
    })
  } catch {
    return mockDashboardData
  }
}
