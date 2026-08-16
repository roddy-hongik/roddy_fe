export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    reissue: '/api/auth/reissue',
    logout: '/api/auth/logout',
  },
  onboarding: {
    complete: '/api/onboarding',
    portfolioPresign: '/api/onboarding/portfolio/presign',
    githubStatus: '/api/onboarding/github',
    githubAuthorize: '/api/onboarding/github/authorize',
  },
  profile: {
    summary: '/api/mypage/profile',
    update: '/api/mypage/profile',
    deleteAccount: '/api/mypage/me',
    // Backend API is not available yet. Keep the frontend placeholder flow for now.
    reanalyze: '/api/reports/reanalyze',
  },
  study: {
    posts: '/api/studies',
    detail: '/api/studies/:id',
    apply: '/api/studies/:id/applications',
    updateApplicationStatus: '/api/studies/:id/applications/:applicationId',
    cancelApplication: '/api/studies/:id/applications/me',
    close: '/api/studies/:id/close',
    reopen: '/api/studies/:id/reopen',
    myApplications: '/api/studies/applications/me',
  },
  community: {
    posts: '/api/community/posts',
    detail: '/api/community/posts/:id',
    like: '/api/community/posts/:id/like',
    report: '/api/community/posts/:id/report',
    comments: '/api/community/posts/:id/comments',
  },
  // Mock domain until backend API is implemented.
  dashboard: {
    summary: '/api/dashboard/summary',
  },
  // Mock domain until backend API is implemented.
  jobs: {
    match: '/api/jobs/:id/match',
  },
  // Mock domain until backend API is implemented.
  roadmap: {
    summary: '/api/roadmap/summary',
    generate: '/api/roadmap/generate',
    saved: '/api/roadmap/saved',
  },
  // Mock domain until backend API is implemented.
  reports: {
    myReports: '/api/reports/me',
    detail: '/api/reports/:id',
    detailAnalysis: '/api/reports/:id/detail-analysis',
    payment: '/api/reports/payment',
  },
  // Mock domain until backend API is implemented.
  admin: {
    crawlingDashboard: '/api/admin/crawling/dashboard',
    users: '/api/admin/users',
    reportedContents: '/api/admin/reported-contents',
    graphSearch: '/api/admin/graph/search',
    graphEdges: '/api/admin/graph/edges',
  },
} as const
