export type DesiredJob =
  | 'BACKEND'
  | 'FRONTEND'
  | 'FULLSTACK'
  | 'IOS'
  | 'ANDROID'
  | 'AI_ML'
  | 'DATA_ENGINEER'
  | 'DEVOPS'
  | 'SECURITY'
  | 'GAME'

export interface PortfolioPresignResponse {
  uploadUrl: string
  objectKey: string
  fileName: string
  contentType: string
  expiresInMinutes: number
}

export interface OnboardingProfileRequest {
  name: string
  age: number
  experienceYears: number
  desiredJob: DesiredJob
  desiredCompany: string
  portfolioObjectKey: string
  portfolioFileName: string
}

export interface OnboardingProfileResponse {
  name: string
  age: number
  experienceLevel: string
  desiredJob: string
  desiredCompany: string
  portfolioFileName: string
  isOnboard: boolean
  githubConnected: boolean
}

export interface GithubConnectionStatusResponse {
  isOnboard: boolean
  githubConnected: boolean
  githubId: string | null
  githubUrl: string | null
}

export interface GithubOAuthStartResponse {
  authorizationUrl: string
}
