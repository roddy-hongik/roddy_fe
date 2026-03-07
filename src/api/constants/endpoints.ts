export const API_ENDPOINTS = {
  auth: {
    kakaoLogin: '/auth/kakao',
    googleLogin: '/auth/google',
  },
  dashboard: {
    summary: '/dashboard/summary',
  },
  profile: {
    summary: '/profile',
    update: '/profile',
    reanalyze: '/profile/re-analyze',
    deleteAccount: '/profile',
  },
  community: {
    posts: '/community/posts',
    comments: '/community/comments',
  },
} as const
