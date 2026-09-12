import { httpClient } from '../../api/client/httpClient'
import { API_ENDPOINTS } from '../../api/constants/endpoints'
import type {
  JobPostingDetail,
  JobPostingListResponse,
  JobPostingSearchParams,
  JobPostingSummary,
  ToggleJobScrapResponse,
} from '../types/jobPosting'

const replaceJobId = (path: string, jobPostingId: number | string) =>
  path.replace(':id', encodeURIComponent(String(jobPostingId)))

const toQueryString = (params: JobPostingSearchParams) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    query.set(key, String(value))
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getJobPostings(params: JobPostingSearchParams = {}): Promise<JobPostingListResponse> {
  return httpClient<JobPostingListResponse>(`${API_ENDPOINTS.jobs.list}${toQueryString(params)}`, {
    method: 'GET',
  })
}

export async function getJobPosting(jobPostingId: number | string): Promise<JobPostingDetail> {
  return httpClient<JobPostingDetail>(replaceJobId(API_ENDPOINTS.jobs.detail, jobPostingId), {
    method: 'GET',
  })
}

export async function getScrappedJobPostings(): Promise<JobPostingSummary[]> {
  return httpClient<JobPostingSummary[]>(API_ENDPOINTS.jobs.myScraps, {
    method: 'GET',
  })
}

export async function toggleJobScrap(jobPostingId: number): Promise<ToggleJobScrapResponse> {
  return httpClient<ToggleJobScrapResponse>(replaceJobId(API_ENDPOINTS.jobs.scrap, jobPostingId), {
    method: 'POST',
  })
}
