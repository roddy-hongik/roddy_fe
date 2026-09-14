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
    imagePresign: '/api/mypage/profile-image/presign',
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
    likedPosts: '/api/community/posts/likes/me',
    filterOptions: '/api/community/posts/filter-options',
  },
  dashboard: {
    summary: '/api/dashboard/summary',
  },
  jobs: {
    list: '/api/jobs',
    detail: '/api/jobs/:id',
    scrap: '/api/jobs/:id/scrap',
    myScraps: '/api/jobs/scraps/me',
    match: '/api/jobs/:id/match',
  },
  roadmap: {
    summary: '/api/roadmap/summary',
    generate: '/api/roadmap/generate',
    saved: '/api/roadmap/saved',
  },
  mockInterview: {
    questions: '/api/mock-interview/questions',
  },
  notifications: {
    list: '/api/notifications',
    read: '/api/notifications/:id/read',
    readAll: '/api/notifications/read-all',
  },
  reports: {
    myReports: '/api/analysis/reports/me',
    detail: '/api/analysis/reports/:id',
    payment: '/api/reports/payment',
  },
  // Crawling, users and moderation are backed by the API. Graph endpoints are mock domains until their APIs exist.
  admin: {
    crawlingDashboard: '/api/admin/crawling/dashboard',
    crawlingRun: '/api/admin/crawling/run',
    users: '/api/admin/users',
    userStatus: '/api/admin/users/:id/status',
    reportedContents: '/api/admin/reported-contents',
    reportedPost: '/api/admin/reported-contents/posts/:id',
    reportedComment: '/api/admin/reported-contents/comments/:id',
    graphSearch: '/api/admin/graph/search',
    graphEdges: '/api/admin/graph/edges',
  },
} as const
