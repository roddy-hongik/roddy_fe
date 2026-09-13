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

export type GraphNodeSummary = {
  id: string
  name: string
  category: string
  relationCount: number
}

export type GraphEdge = {
  id: string
  source: string
  relationType: GraphRelationType
  target: string
  createdBy: 'AI' | 'manual'
  confidence: number
  description?: string
}

export type GraphSearchResult = {
  searchedNode: GraphNodeSummary | null
  edges: GraphEdge[]
}

export type EdgePayload = {
  source: string
  relationType: GraphRelationType
  target: string
  description?: string
}
