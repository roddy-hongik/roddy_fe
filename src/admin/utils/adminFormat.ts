import type {
  AdminUserStatus,
  ContentType,
  CrawlingCompanyStatus,
  GraphEdgeCreatedBy,
  GraphRelationType,
} from '../../api/types/admin'

/** 값이 없으면(예: 한 번도 수집하지 않은 회사) 기록이 없다고 보여준다. */
export const formatDateTime = (value: string | null) => {
  if (!value) {
    return '기록 없음'
  }

  const date = new Date(value)
  // 알아볼 수 없는 값이면 "Invalid Date" 대신 받은 값을 그대로 보여준다.
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

export const crawlingStatusLabelMap: Record<CrawlingCompanyStatus, string> = {
  healthy: '정상',
  warning: '주의',
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

export const graphCreatedByLabelMap: Record<GraphEdgeCreatedBy, string> = {
  auto: '자동(공고)',
  manual: '어드민',
}

export const graphRelationLabelMap: Record<GraphRelationType, string> = {
  RELATED_TO: '관련 있음',
  USED_WITH: '같은 공고에서 함께 요구됨',
  PREREQUISITE_OF: 'Source 를 Target 보다 먼저 배움',
  SIMILAR_TO: '서로 대신 쓸 수 있음',
}
