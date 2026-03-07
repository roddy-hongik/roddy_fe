import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type { DeleteAccountResponse, ProfileSummary, ReanalyzePayload, UpdateProfilePayload } from '../../profile/types/profile'

export async function getProfileSummary(): Promise<ProfileSummary> {
  return httpClient<ProfileSummary>(API_ENDPOINTS.profile.summary, {
    method: 'GET',
  })
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileSummary> {
  return httpClient<ProfileSummary>(API_ENDPOINTS.profile.update, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function requestProfileReanalysis(payload: ReanalyzePayload): Promise<{ taskId?: string }> {
  return httpClient<{ taskId?: string }>(API_ENDPOINTS.profile.reanalyze, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  return httpClient<DeleteAccountResponse>(API_ENDPOINTS.profile.deleteAccount, {
    method: 'DELETE',
  })
}
