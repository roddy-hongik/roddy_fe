import { API_ENDPOINTS } from '../constants/endpoints'
import { httpClient } from '../client/httpClient'
import type {
  DeleteAccountResponse,
  ProfileImagePresignResponse,
  ProfileSummary,
  UpdateProfilePayload,
} from '../../profile/types/profile'

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

export async function requestProfileImagePresign(fileName: string): Promise<ProfileImagePresignResponse> {
  return httpClient<ProfileImagePresignResponse>(API_ENDPOINTS.profile.imagePresign, {
    method: 'POST',
    body: JSON.stringify({ fileName }),
  })
}

export async function uploadProfileImage(presign: ProfileImagePresignResponse, file: File): Promise<void> {
  const response = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': presign.contentType,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error('프로필 이미지 업로드에 실패했습니다.')
  }
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  return httpClient<DeleteAccountResponse>(API_ENDPOINTS.profile.deleteAccount, {
    method: 'DELETE',
  })
}
