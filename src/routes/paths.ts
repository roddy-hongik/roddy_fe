export const ROUTES = {
  home: '/',
  login: '/login',
  jobs: '/jobs',
  community: '/community',
  reports: '/reports',
  reportsDetailAnalysis: '/reports/detail-analysis',
  reportsPayment: '/reports/payment',
  terms: '/terms',
  onboarding: '/onboarding',
  onboardingGithub: '/onboarding/github',
  onboardingWaiting: '/onboarding/analysis-waiting',
  profile: '/profile',
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
