import type { InterviewAnalysisSummary } from '../types/mockInterview'

export const mockInterviewSummary: InterviewAnalysisSummary = {
  currentSkills: ['Java', 'Spring Boot', 'JPA'],
  gapSkills: ['QueryDSL', 'Redis', '대용량 트래픽 처리'],
  targetJob: '금융권 백엔드 개발자',
  targetCompany: '토스',
}

export const mockGeneratedQuestions = [
  'QueryDSL과 JPQL의 차이점을 설명해주세요.',
  '동적 쿼리가 필요한 상황에서 QueryDSL을 사용하는 이유는 무엇인가요?',
  '금융 서비스에서 복잡한 조회 조건을 QueryDSL로 설계할 때 고려할 점은 무엇인가요?',
]
