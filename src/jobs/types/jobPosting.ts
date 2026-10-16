export type JobPostingStatus = 'OPEN' | 'CLOSED'

export type RecruitType = 'INTERN' | 'JUNIOR' | 'SENIOR'

/** 목록 정렬. 최신순이 기본이고, 매칭률순은 로그인해 역량 분석을 받은 사용자에게만 의미가 있다. */
export type JobPostingSort = 'latest' | 'match'

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
  /** 공고 글에서 뽑아낸 요구 기술. 사전에 없는 기술은 잡히지 않는다. */
  techStacks: string[]
  /**
   * 내 기술스택과의 적합도(0~100).
   * 로그인 전, 역량 분석 전, 공고에서 기술을 찾지 못한 경우 null 이다. null 은 0% 가 아니라 "아직 낼 수 없음"이다.
   */
  matchRate: number | null
  isScrapped: boolean
}

/** 상세 응답에는 매칭률이 없다. 매칭 분석은 {@link JobPostingMatch} 로 따로 받는다. */
export interface JobPostingDetail extends Omit<JobPostingSummary, 'matchRate'> {
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
  sort?: JobPostingSort
  page?: number
  size?: number
}

export interface ToggleJobScrapResponse {
  jobPostingId: number
  isScrapped: boolean
}

/** 공고가 요구하는 기술 하나와 그에 대한 내 숙련도. */
export interface JobMatchStack {
  name: string
  /** 0~100. 갖고 있지 않으면 0. */
  userScore: number
  held: boolean
}

export interface JobPostingMatch {
  jobPostingId: number
  /** 견줄 근거가 없으면 null. 0% 가 아니라 "아직 판단할 수 없음"이다. */
  matchRate: number | null
  requiredCount: number
  matchedCount: number
  /** 0 이면 아직 역량 분석 결과가 없다. */
  userStackCount: number
  /** 가진 기술이 앞에 온다. */
  stacks: JobMatchStack[]
  /** 공고는 요구하지만 갖고 있지 않은 기술. */
  missingStacks: string[]
}
