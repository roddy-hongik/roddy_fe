import type { StudyPost } from '../types/study'

export const mockStudies: StudyPost[] = [
  {
    id: 'study-1',
    title: '백엔드 면접 대비 스터디 모집',
    description: 'Spring Boot, JPA, CS 면접 질문을 함께 정리하고 모의면접까지 진행할 스터디원을 모집합니다.',
    mode: 'offline',
    location: '강남역 인근 스터디룸',
    scheduledAt: '2026-05-10T19:30',
    capacity: 4,
    status: 'recruiting',
    authorName: '시애니',
    createdAt: '2026-05-01T10:00:00.000Z',
    applicants: [
      {
        id: 'study-1-app-1',
        applicantName: '민수',
        appliedAt: '2026-05-02T12:00:00.000Z',
        status: 'accepted',
      },
      {
        id: 'study-1-app-2',
        applicantName: '지연',
        appliedAt: '2026-05-03T09:00:00.000Z',
        status: 'pending',
      },
    ],
  },
  {
    id: 'study-2',
    title: '비대면 알고리즘 스터디 멤버 구해요',
    description: '주 2회 저녁에 온라인으로 만나 문제 풀이와 코드 리뷰를 진행할 분을 찾고 있습니다.',
    mode: 'online',
    location: 'Discord / Google Meet',
    scheduledAt: '2026-05-12T20:00',
    capacity: 6,
    status: 'completed',
    authorName: '도현',
    createdAt: '2026-04-28T13:40:00.000Z',
    applicants: [
      {
        id: 'study-2-app-1',
        applicantName: '하린',
        appliedAt: '2026-04-29T08:10:00.000Z',
        status: 'accepted',
      },
      {
        id: 'study-2-app-2',
        applicantName: '유진',
        appliedAt: '2026-04-29T09:22:00.000Z',
        status: 'accepted',
      },
      {
        id: 'study-2-app-3',
        applicantName: '태윤',
        appliedAt: '2026-04-30T11:45:00.000Z',
        status: 'accepted',
      },
    ],
  },
]
