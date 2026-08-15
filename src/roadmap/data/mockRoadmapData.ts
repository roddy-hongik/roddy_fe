import type { AnalysisSummary, GeneratedRoadmap } from '../../api/types/roadmap'

export const mockAnalysisSummary: AnalysisSummary = {
  currentSkills: ['Java', 'Spring Boot', 'JPA'],
  gapSkills: ['QueryDSL', 'Redis', '대용량 트래픽 처리'],
  targetJob: '금융권 백엔드 개발자',
  targetCompany: '토스',
}

export const createMockRoadmap = (): GeneratedRoadmap => ({
  title: '금융권 백엔드 개발자를 위한 QueryDSL 중심 성장 로드맵',
  steps: [
    {
      stage: '기초',
      goal: 'QueryDSL의 기본 개념과 동적 쿼리 작성 방식을 익힌다.',
      topics: ['QueryDSL 기본 문법', 'QClass 이해', 'BooleanExpression', '기본 조회 패턴'],
      outputs: ['간단한 조건 검색 API 구현'],
    },
    {
      stage: '심화',
      goal: '복잡한 조회와 성능 이슈를 고려한 설계를 익힌다.',
      topics: ['복잡한 조인', '페이징 최적화', 'N+1 문제', '조회 성능 개선'],
      outputs: ['관리자 조회 API 리팩토링', '성능 비교 문서 작성'],
    },
    {
      stage: '실전 프로젝트',
      goal: '실무형 문제를 해결할 수 있는 수준으로 적용한다.',
      topics: ['금융 상품 검색 API', '조건 기반 추천 조회', '대용량 데이터 조회 전략'],
      outputs: ['포트폴리오 프로젝트', '기술 회고 문서'],
    },
  ],
})
