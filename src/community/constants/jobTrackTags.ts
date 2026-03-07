import type { JobTrackTag, JobTrackTagKey } from '../types/community'

export const JOB_TRACK_TAGS: JobTrackTag[] = [
  {
    key: 'b2c',
    label: 'B2C',
    description: '사용자 많은 서비스 플랫폼 지망',
  },
  {
    key: 'fintech',
    label: '금융 및 핀테크',
    description: '안정성과 데이터 정확성 중시',
  },
  {
    key: 'b2b',
    label: 'B2B',
    description: '엔터프라이즈 & SaaS 지망',
  },
  {
    key: 'infra-devops',
    label: 'Infra/DevOps',
    description: '인프라 자동화 및 운영 중심',
  },
  {
    key: 'generalist',
    label: 'Generalist',
    description: '초기 스타트업 및 빠른 검증 중심',
  },
]

export const TAG_LABEL_MAP = Object.fromEntries(JOB_TRACK_TAGS.map((tag) => [tag.key, tag.label])) as Record<JobTrackTagKey, string>
