export type CrawlingPlatformStatus = 'healthy' | 'warning' | 'error'

export type CrawlingPlatform = {
  id: string
  name: string
  collectedToday: number
  successCount: number
  failCount: number
  lastCrawledAt: string
  status: CrawlingPlatformStatus
}

export type CrawlingDashboard = {
  totalCollectedToday: number
  successCount: number
  failCount: number
  lastCrawledAt: string
  platforms: CrawlingPlatform[]
}

export type AdminUserStatus = 'active' | 'suspended'

export type AdminUser = {
  id: string
  nickname: string
  email: string
  status: AdminUserStatus
  reportCount: number
  joinedAt: string
  lastActiveAt: string
}

export type ContentType = 'post' | 'comment'
export type ReportedContentStatus = 'reported' | 'removed'

export type ReportedContent = {
  id: string
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
