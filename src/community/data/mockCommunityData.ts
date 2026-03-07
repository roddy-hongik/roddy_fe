import type { CommunityPostDetail, CommunityPostSummary } from '../types/community'

export const mockCommunityPosts: CommunityPostSummary[] = [
  {
    id: '1',
    title: 'B2C 서비스에서 지표 설계할 때 가장 먼저 보는 건 무엇인가요?',
    authorName: '하준',
    views: 312,
    likes: 41,
    tag: 'b2c',
    createdAt: '2026-03-06T09:12:00.000Z',
  },
  {
    id: '2',
    title: '핀테크 백엔드 장애 대응 런북 공유 부탁드립니다',
    authorName: '민서',
    views: 198,
    likes: 27,
    tag: 'fintech',
    createdAt: '2026-03-05T14:05:00.000Z',
  },
  {
    id: '3',
    title: 'SaaS 멀티테넌시 아키텍처, 초기에 어디까지 분리해야 할까요?',
    authorName: '지원',
    views: 287,
    likes: 36,
    tag: 'b2b',
    createdAt: '2026-03-05T02:35:00.000Z',
  },
]

export const mockCommunityPostDetails: CommunityPostDetail[] = [
  {
    id: '1',
    title: 'B2C 서비스에서 지표 설계할 때 가장 먼저 보는 건 무엇인가요?',
    authorName: '하준',
    views: 312,
    likes: 41,
    tag: 'b2c',
    createdAt: '2026-03-06T09:12:00.000Z',
    content:
      '현재 일간 활성 사용자 중심으로 보다가 리텐션과 전환 퍼널을 함께 묶어서 보고 있습니다. B2C에서 실무적으로 우선순위 두는 지표 조합이 궁금합니다.',
    imageUrls: ['https://images.unsplash.com/photo-1551281044-8b2ce0f6f5d2?auto=format&fit=crop&w=1200&q=80'],
    comments: [
      {
        id: 'c-1',
        author: '지민',
        content: '초기에는 리텐션 코호트와 핵심 행동 이벤트를 같이 보시면 방향 잡기 좋습니다.',
        depth: 0,
        parentId: null,
        createdAt: '2026-03-06T10:08:00.000Z',
      },
      {
        id: 'c-2',
        author: '윤호',
        content: '리텐션 기준을 잡은 뒤 전환 퍼널에서 단계별 이탈 사유 로그를 먼저 심어두는 걸 추천합니다.',
        depth: 1,
        parentId: 'c-1',
        createdAt: '2026-03-06T10:31:00.000Z',
      },
    ],
  },
  {
    id: '2',
    title: '핀테크 백엔드 장애 대응 런북 공유 부탁드립니다',
    authorName: '민서',
    views: 198,
    likes: 27,
    tag: 'fintech',
    createdAt: '2026-03-05T14:05:00.000Z',
    content:
      '결제 승인 지연 이슈가 재발하고 있어요. 알림 체계와 롤백 기준을 팀에서 어떻게 정의하고 있는지 사례를 듣고 싶습니다.',
    imageUrls: [],
    comments: [],
  },
  {
    id: '3',
    title: 'SaaS 멀티테넌시 아키텍처, 초기에 어디까지 분리해야 할까요?',
    authorName: '지원',
    views: 287,
    likes: 36,
    tag: 'b2b',
    createdAt: '2026-03-05T02:35:00.000Z',
    content:
      'B2B SaaS 신규 프로젝트를 시작했는데, tenant별 데이터 분리 단계를 처음부터 강하게 가져가야 할지 고민입니다. 경험 공유 부탁드립니다.',
    imageUrls: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80'],
    comments: [
      {
        id: 'c-3',
        author: '서윤',
        content: '초기엔 논리 분리 + 강한 권한 검증으로 시작하고, 고객 요구에 따라 물리 분리 단계로 가는 편이 현실적이었습니다.',
        depth: 0,
        parentId: null,
        createdAt: '2026-03-05T04:15:00.000Z',
      },
      {
        id: 'c-4',
        author: '가은',
        content: '동의합니다. tenant 규모 기준 임계치를 먼저 정의해두면 분리 시점 의사결정이 빨라집니다.',
        depth: 1,
        parentId: 'c-3',
        createdAt: '2026-03-05T05:02:00.000Z',
      },
    ],
  },
]
