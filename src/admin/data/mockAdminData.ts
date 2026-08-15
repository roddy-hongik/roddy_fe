import type { AdminUser, CrawlingDashboard, GraphSearchResult, ReportedContent } from '../../api/types/admin'

export const mockCrawlingDashboard: CrawlingDashboard = {
  totalCollectedToday: 128,
  successCount: 120,
  failCount: 8,
  lastCrawledAt: '2026-03-16T09:30:00',
  platforms: [
    {
      id: 'saramin',
      name: '사람인',
      collectedToday: 54,
      successCount: 52,
      failCount: 2,
      lastCrawledAt: '2026-03-16T09:20:00',
      status: 'healthy',
    },
    {
      id: 'wanted',
      name: '원티드',
      collectedToday: 74,
      successCount: 68,
      failCount: 6,
      lastCrawledAt: '2026-03-16T09:28:00',
      status: 'warning',
    },
  ],
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'u1',
    nickname: 'backend_rookie',
    email: 'rookie@example.com',
    status: 'active',
    reportCount: 1,
    joinedAt: '2026-01-10',
    lastActiveAt: '2026-03-15T20:00:00',
  },
  {
    id: 'u2',
    nickname: 'spam_user',
    email: 'spam@example.com',
    status: 'suspended',
    reportCount: 7,
    joinedAt: '2025-12-01',
    lastActiveAt: '2026-03-14T08:00:00',
  },
  {
    id: 'u3',
    nickname: 'api_builder',
    email: 'api@example.com',
    status: 'active',
    reportCount: 4,
    joinedAt: '2026-02-11',
    lastActiveAt: '2026-03-16T08:45:00',
  },
]

export const mockReportedContents: ReportedContent[] = [
  {
    id: 'p1',
    type: 'post',
    author: 'anonymous123',
    contentPreview: '이 글은 부적절한 내용을 포함하고 있습니다...',
    fullContent: '이 글은 부적절한 내용을 포함하고 있습니다. 공격적 표현과 비방이 반복됩니다.',
    reportCount: 5,
    createdAt: '2026-03-15T13:20:00',
    status: 'reported',
  },
  {
    id: 'c1',
    type: 'comment',
    author: 'bad_commenter',
    contentPreview: '공격적인 표현이 포함된 댓글입니다...',
    fullContent: '공격적인 표현이 포함된 댓글입니다. 특정 사용자에 대한 모욕성 문구가 확인됩니다.',
    reportCount: 3,
    createdAt: '2026-03-15T16:10:00',
    status: 'reported',
  },
]

export const mockGraphSearchResult: GraphSearchResult = {
  searchedNode: {
    id: 'n1',
    name: 'QueryDSL',
    category: 'backend',
    relationCount: 3,
  },
  edges: [
    {
      id: 'e1',
      source: 'QueryDSL',
      relationType: 'RELATED_TO',
      target: 'JPA',
      createdBy: 'AI',
      confidence: 0.86,
      description: 'ORM 쿼리 계층에서 함께 사용되는 조합',
    },
    {
      id: 'e2',
      source: 'QueryDSL',
      relationType: 'USED_WITH',
      target: 'Spring Boot',
      createdBy: 'manual',
      confidence: 0.94,
      description: '실무 프로젝트에서 자주 함께 구성',
    },
    {
      id: 'e3',
      source: 'QueryDSL',
      relationType: 'PREREQUISITE_OF',
      target: '동적 조건 조회 설계',
      createdBy: 'AI',
      confidence: 0.79,
    },
  ],
}
