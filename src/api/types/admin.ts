/** 마지막 수집 결과로 매긴 상태. warning 은 점검에 걸렸거나 아직 한 번도 수집하지 않은 회사다. */
export type CrawlingCompanyStatus = 'healthy' | 'warning' | 'error'

/** 수집 현황의 한 줄. 회사 채용 사이트를 직접 수집하므로 한 줄이 곧 회사 한 곳이다. */
export type CrawlingCompany = {
  /** 수집 명세의 회사 코드 (예: kakao) */
  id: string
  name: string
  collectedToday: number
  successCount: number
  failCount: number
  /** 한 번도 수집하지 않았으면 null */
  lastCrawledAt: string | null
  status: CrawlingCompanyStatus
}

export type CrawlingDashboard = {
  totalCollectedToday: number
  successCount: number
  failCount: number
  lastCrawledAt: string | null
  /** 마지막 수집이 실패한 회사 수 */
  errorCount: number
  /** 점검에 걸렸거나 아직 한 번도 수집하지 않은 회사 수 */
  warningCount: number
  /** 지금 수집이 돌고 있는지. 켜져 있으면 끝날 때까지 다시 조회한다. */
  running: boolean
  /** 문제가 있는 회사가 앞에 온다. */
  companies: CrawlingCompany[]
}

export type AdminUserStatus = 'active' | 'suspended'

export type AdminUser = {
  id: string
  nickname: string
  email: string
  status: AdminUserStatus
  reportCount: number
  joinedAt: string
  /** 마지막으로 로그인했거나 토큰을 재발급받은 시각. 기록이 없으면 null */
  lastActiveAt: string | null
}

export type ContentType = 'post' | 'comment'
export type ReportedContentStatus = 'reported' | 'removed'

export type ReportedContent = {
  /** 화면에서 쓰는 키. 글과 댓글의 id 는 서로 겹칠 수 있어 type 을 붙인다. 예: post-12 */
  id: string
  /** 백엔드의 글 id 또는 댓글 id */
  contentId: string
  type: ContentType
  author: string
  contentPreview: string
  fullContent: string
  reportCount: number
  createdAt: string
  status: ReportedContentStatus
}

export type GraphRelationType = 'RELATED_TO' | 'USED_WITH' | 'PREREQUISITE_OF' | 'SIMILAR_TO'

/** auto 는 모집 중인 공고로 자동 계산한 관계, manual 은 어드민이 만들거나 고친 관계다. */
export type GraphEdgeCreatedBy = 'auto' | 'manual'

export type GraphNodeSummary = {
  /** 기술 이름. 노드는 이름으로 구분한다. */
  id: string
  name: string
  /** 기술 사전의 분류 (language, backend, ...) */
  category: string
  /** 지우지 않은 관계 수 */
  relationCount: number
}

export type GraphEdge = {
  id: string
  source: string
  relationType: GraphRelationType
  target: string
  createdBy: GraphEdgeCreatedBy
  /** 0~1. 자동 관계는 함께 요구된 비율이고, 어드민이 만든 관계는 1 이다. */
  confidence: number
  description: string | null
}

/** 사전에 없는 기술이거나 아직 그래프를 갱신하지 않았으면 searchedNode 가 null 이고 관계도 비어 있다. */
export type GraphSearchResult = {
  searchedNode: GraphNodeSummary | null
  edges: GraphEdge[]
}

/** 기술 이름에는 별칭(예: 자바)을 써도 된다. */
export type EdgePayload = {
  source: string
  relationType: GraphRelationType
  target: string
  description?: string
}

export type GraphRebuildResult = {
  /** 사전과 맞춘 기술 노드 수 */
  technologyStackCount: number
  /** 새로 만든 자동 관계 수 */
  autoRelationCount: number
}
