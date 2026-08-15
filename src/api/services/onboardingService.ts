import { httpClient } from '../client/httpClient'
import { API_ENDPOINTS } from '../constants/endpoints'
import type {
  GithubConnectionStatusResponse,
  GithubOAuthStartResponse,
  OnboardingProfileRequest,
  OnboardingProfileResponse,
  PortfolioPresignResponse,
} from '../types/onboarding'

type CompleteOnboardingPayload = Omit<OnboardingProfileRequest, 'portfolioObjectKey' | 'portfolioFileName'> & {
  portfolioFile: File
}

export async function requestPortfolioPresign(fileName: string): Promise<PortfolioPresignResponse> {
  return httpClient<PortfolioPresignResponse>(API_ENDPOINTS.onboarding.portfolioPresign, {
    method: 'POST',
    body: JSON.stringify({ fileName }),
  })
}

export async function uploadPortfolioFile(presign: PortfolioPresignResponse, file: File): Promise<void> {
  const response = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || presign.contentType || 'application/pdf',
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error('포트폴리오 업로드에 실패했습니다.')
  }
}

export async function saveOnboardingProfile(payload: OnboardingProfileRequest): Promise<OnboardingProfileResponse> {
  return httpClient<OnboardingProfileResponse>(API_ENDPOINTS.onboarding.complete, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function completeOnboarding(payload: CompleteOnboardingPayload): Promise<OnboardingProfileResponse> {
  const presign = await requestPortfolioPresign(payload.portfolioFile.name)
  await uploadPortfolioFile(presign, payload.portfolioFile)

  return saveOnboardingProfile({
    name: payload.name,
    age: payload.age,
    experienceYears: payload.experienceYears,
    desiredJob: payload.desiredJob,
    desiredCompany: payload.desiredCompany,
    portfolioObjectKey: presign.objectKey,
    portfolioFileName: presign.fileName,
  })
}

export async function getGithubConnectionStatus(): Promise<GithubConnectionStatusResponse> {
  return httpClient<GithubConnectionStatusResponse>(API_ENDPOINTS.onboarding.githubStatus, {
    method: 'GET',
  })
}

export async function getGithubAuthorizationUrl(): Promise<GithubOAuthStartResponse> {
  return httpClient<GithubOAuthStartResponse>(API_ENDPOINTS.onboarding.githubAuthorize, {
    method: 'GET',
  })
}
