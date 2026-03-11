import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type { JobPostingMatch } from '../../jobs/types/jobMatching'

export async function getJobPostingMatch(jobId: string): Promise<JobPostingMatch> {
  return httpClient<JobPostingMatch>(API_ENDPOINTS.jobs.match.replace(':id', encodeURIComponent(jobId)), {
    method: 'GET',
  })
}
