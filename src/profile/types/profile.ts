export interface ProfileSummary {
  name: string
  age: number
  profileImageUrl: string | null
  desiredJob: string
  desiredCompany: string
  experienceYears: string
  portfolioFileName: string
  portfolioUrl: string | null
  githubConnected: boolean
}

export interface UpdateProfilePayload {
  name: string
  age: number
  profileImageObjectKey?: string
  removeProfileImage?: boolean
}

export interface ProfileImagePresignResponse {
  uploadUrl: string
  objectKey: string
  contentType: 'image/png' | 'image/jpeg'
  expiresInMinutes: number
}

export type DeleteAccountResponse = void
