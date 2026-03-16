import { ROUTES, routePaths } from '../../routes/paths'
import type { NotificationItem } from '../types/notification'

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'job_match',
    title: '맞춤 공고 알림',
    message: '내 스택과 92% 일치하는 새로운 공고가 등록되었어요.',
    createdAt: '2026-03-16T10:30:00.000Z',
    isRead: false,
    relatedJobId: '2',
    relatedPath: routePaths.jobDetail('2'),
  },
  {
    id: 'n2',
    type: 'growth_report',
    title: '성장 리포트 알림',
    message: '이번 주에 GitHub에 커밋이 5번 있었네요! 기술 숙련도가 상승했습니다.',
    createdAt: '2026-03-16T08:00:00.000Z',
    isRead: false,
    relatedPath: ROUTES.notifications,
  },
  {
    id: 'n3',
    type: 'job_match',
    title: '맞춤 공고 알림',
    message: 'QueryDSL, JPA 역량과 잘 맞는 백엔드 공고가 올라왔어요.',
    createdAt: '2026-03-15T16:10:00.000Z',
    isRead: true,
    relatedJobId: 'adl-data-platform',
    relatedPath: routePaths.jobDetail('adl-data-platform'),
  },
  {
    id: 'n4',
    type: 'growth_report',
    title: '성장 리포트 알림',
    message: '이번 주 학습 로드맵 2단계를 완료했어요. 꾸준히 성장하고 있어요.',
    createdAt: '2026-03-14T12:00:00.000Z',
    isRead: true,
    relatedPath: ROUTES.notifications,
  },
]
