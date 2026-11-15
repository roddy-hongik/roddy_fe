import { httpClient } from '../../api/client/httpClient'
import { API_ENDPOINTS } from '../../api/constants/endpoints'
import type {
  CreateStudyPayload,
  StudyApplicationStatus,
  StudyApplicationResponse,
  StudyApplicantSummary,
  StudyCloseResponse,
  StudyMode,
  StudyPostDetail,
  StudyPostListResponse,
  StudyStatus,
} from '../types/study'

const replaceStudyId = (path: string, studyId: string | number) => path.replace(':id', encodeURIComponent(String(studyId)))
const replaceApplicationId = (path: string, applicationId: number) => path.replace(':applicationId', encodeURIComponent(String(applicationId)))

export const STUDY_PAGE_SIZE = 20

export type StudyListQuery = {
  status?: StudyStatus
  mode?: StudyMode
  keyword?: string
  page?: number
  size?: number
}

export async function getStudies(query: StudyListQuery = {}): Promise<StudyPostListResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 0),
    size: String(query.size ?? STUDY_PAGE_SIZE),
  })
  if (query.status) params.set('status', query.status)
  if (query.mode) params.set('mode', query.mode)
  const keyword = query.keyword?.trim()
  if (keyword) params.set('keyword', keyword)

  return httpClient<StudyPostListResponse>(`${API_ENDPOINTS.study.posts}?${params.toString()}`, {
    method: 'GET',
  })
}

export async function getStudyDetail(studyId: string): Promise<StudyPostDetail> {
  return httpClient<StudyPostDetail>(replaceStudyId(API_ENDPOINTS.study.detail, studyId), {
    method: 'GET',
  })
}

export async function createStudy(payload: CreateStudyPayload): Promise<{ id: number }> {
  return httpClient<{ id: number }>(API_ENDPOINTS.study.posts, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function applyToStudy(studyId: string): Promise<StudyApplicationResponse> {
  return httpClient<StudyApplicationResponse>(replaceStudyId(API_ENDPOINTS.study.apply, studyId), {
    method: 'POST',
  })
}

export async function cancelStudyApplication(studyId: string): Promise<StudyApplicationResponse> {
  return httpClient<StudyApplicationResponse>(replaceStudyId(API_ENDPOINTS.study.cancelApplication, studyId), {
    method: 'DELETE',
  })
}

export async function closeStudy(studyId: string): Promise<StudyCloseResponse> {
  return httpClient<StudyCloseResponse>(replaceStudyId(API_ENDPOINTS.study.close, studyId), {
    method: 'PATCH',
  })
}

export async function reopenStudy(studyId: string): Promise<StudyCloseResponse> {
  return httpClient<StudyCloseResponse>(replaceStudyId(API_ENDPOINTS.study.reopen, studyId), {
    method: 'PATCH',
  })
}

export async function updateStudyApplicationStatus(
  studyId: string,
  applicationId: number,
  status: StudyApplicationStatus,
): Promise<StudyApplicationResponse> {
  return httpClient<StudyApplicationResponse>(
    replaceApplicationId(replaceStudyId(API_ENDPOINTS.study.updateApplicationStatus, studyId), applicationId),
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  )
}

export function sortStudyApplicants(applicants: StudyApplicantSummary[]) {
  return [...applicants].sort((left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime())
}
