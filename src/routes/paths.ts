export const ROUTES = {
  home: '/',
  login: '/login',
  jobs: '/jobs',
  community: '/community',
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
} as const

export const routePatterns = {
  jobDetail: `${ROUTES.jobs}/:jobId`,
} as const
