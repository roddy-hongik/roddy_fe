import type { GraphSearchResult } from '../../api/types/admin'

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
