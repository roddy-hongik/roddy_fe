import type { AdminUserStatus, ContentType, CrawlingPlatformStatus } from '../../api/types/admin'

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

export const crawlingStatusLabelMap: Record<CrawlingPlatformStatus, string> = {
  healthy: '정상',
  warning: '지연',
  error: '오류',
}

export const userStatusLabelMap: Record<AdminUserStatus, string> = {
  active: '정상',
  suspended: '정지',
}

export const contentTypeLabelMap: Record<ContentType, string> = {
  post: '게시글',
  comment: '댓글',
}
