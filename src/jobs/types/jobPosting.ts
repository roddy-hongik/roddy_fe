export type JobPostingStatus = 'OPEN' | 'CLOSED'

export type RecruitType = 'INTERN' | 'JUNIOR' | 'SENIOR'

/**
 * 백엔드가 수집한 공고. 채용 사이트가 주지 않는 값이 많아 대부분의 필드가 비어 있을 수 있다.
 * 연봉/팀 정보는 아예 수집되지 않으므로 필드 자체가 없다.
 */
export interface JobPostingSummary {
  id: number
  companyCode: string
  company: string
  title: string
  /** 수집 원본의 직무 분류 문자열. */
  recruitField: string | null
  /** 인턴 / 신입 / 경력직. 경력 정보를 주는 회사가 적어 대부분 null. */
  experience: string | null
  /** 정규직 / 계약직 등 고용 형태. */
  workType: string | null
  location: string | null
  postedAt: string | null
  /** null 이면 상시 채용. */
  deadline: string | null
  status: JobPostingStatus
  applyUrl: string
  isScrapped: boolean
}

export interface JobPostingDetail extends JobPostingSummary {
  /** 공고 본문 원문. 상세 수집이 아직 돌지 않았으면 비어 있다. */
  content: string | null
  sourceUpdatedAt: string | null
}

export interface JobPostingListResponse {
  jobs: JobPostingSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface JobPostingSearchParams {
  keyword?: string
  company?: string
  recruitType?: RecruitType
  status?: JobPostingStatus
  page?: number
  size?: number
}

export interface ToggleJobScrapResponse {
  jobPostingId: number
  isScrapped: boolean
}
