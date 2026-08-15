import type { JobCategory } from '../onboarding/components/JobCategorySelector'

export const PROFILE_JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'b2c',
    label: 'B2C',
    description: '네이버, 카카오, 배달의민족 같은 대규모 사용자 서비스 플랫폼을 지향하는 유형입니다.',
  },
  {
    id: 'fintech',
    label: '금융',
    description: '토스, 카카오뱅크, 은행권처럼 안정성과 데이터 정확성을 중심으로 제품을 만드는 유형입니다.',
  },
  {
    id: 'b2b',
    label: 'B2B',
    description: '엔터프라이즈 SaaS 등 기업 고객의 생산성을 높이는 솔루션을 만드는 유형입니다.',
  },
  {
    id: 'infra',
    label: 'Infra',
    description: '인프라 자동화, 플랫폼 엔지니어링, 서버 운영과 개발 생산성 개선에 집중하는 유형입니다.',
  },
  {
    id: 'generalist',
    label: 'Generalist',
    description: '초기 스타트업에서 빠른 실행과 비즈니스 검증을 우선하며 넓은 역할을 담당하는 유형입니다.',
  },
]

export const PROFILE_COMPANIES_BY_CATEGORY: Record<string, string[]> = {
  b2c: ['네이버', '카카오', '배달의민족', '당근', '쿠팡'],
  fintech: ['토스', '카카오뱅크', '신한은행', '국민은행', '하나은행'],
  b2b: ['채널톡', '토스페이먼츠', '센드버드', '리멤버앤컴퍼니', '스윗'],
  infra: ['네이버클라우드', '카카오엔터프라이즈', 'AWS 코리아', 'NHN Cloud', '메가존클라우드'],
  generalist: ['마켓컬리', '직방', '오늘의집', '강남언니', '리디'],
}
