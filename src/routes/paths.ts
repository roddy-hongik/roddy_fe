export const ROUTES = {
  home: '/',
  login: '/login',
  jobs: '/jobs',
  notifications: '/notifications',
  mockInterview: '/mock-interview',
  roadmap: '/roadmap',
  admin: '/admin',
  adminCrawling: '/admin/crawling',
  adminModeration: '/admin/moderation',
  adminGraph: '/admin/graph-db',
  community: '/community',
  communityWrite: '/community/write',
  reports: '/reports',
  reportsDetailAnalysis: '/reports/detail-analysis',
  reportsPayment: '/reports/payment',
  terms: '/terms',
  onboarding: '/onboarding',
  onboardingGithub: '/onboarding/github',
  onboardingWaiting: '/onboarding/analysis-waiting',
  profile: '/profile',
  profileSaved: '/profile/saved',
  profileEdit: '/profile/edit',
  profileReanalyze: '/profile/re-analyze',
} as const

export const routePaths = {
  jobDetail: (jobId: string) => `${ROUTES.jobs}/${jobId}`,
  reportDetailAnalysis: (reportId: string | number) => `${ROUTES.reports}/${reportId}/detail-analysis`,
} as const

export const routePatterns = {
  jobDetail: `${ROUTES.jobs}/:jobId`,
  reportDetailAnalysis: `${ROUTES.reports}/:reportId/detail-analysis`,
} as const
