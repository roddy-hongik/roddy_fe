export type StudyMode = 'OFFLINE' | 'ONLINE'
export type StudyStatus = 'RECRUITING' | 'CLOSED'
export type StudyApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED' | 'CANCELED'

export interface StudyApplicantSummary {
  applicationId: number
  applicantId: number
  applicantName: string
  status: StudyApplicationStatus
  statusDisplayName: string
  appliedAt: string
}

export interface StudyPostSummary {
  id: number
  title: string
  contentPreview: string
  mode: StudyMode
  modeDisplayName: string
  location: string
  scheduledAt: string
  capacity: number
  applicantCount: number
  status: StudyStatus
  statusDisplayName: string
}

export interface StudyPostDetail {
  id: number
  title: string
  content: string
  authorName: string
  createdAt: string
  mode: StudyMode
  modeDisplayName: string
  location: string
  scheduledAt: string
  capacity: number
  applicantCount: number
  status: StudyStatus
  statusDisplayName: string
  myApplicationStatus: StudyApplicationStatus | null
  myApplicationStatusDisplayName: string | null
  isAuthor: boolean
  applicants: StudyApplicantSummary[]
}

export interface StudyPostListResponse {
  studies: StudyPostSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface StudyApplicationResponse {
  applicationId: number
  status: StudyApplicationStatus
  statusDisplayName: string
  applicantCount: number
}

export interface StudyCloseResponse {
  id: number
  status: StudyStatus
  statusDisplayName: string
}

export interface CreateStudyPayload {
  title: string
  content: string
  mode: StudyMode
  location: string
  scheduledAt: string
  capacity: number
}
