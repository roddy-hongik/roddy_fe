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
  profileImageUrl?: string | null
}

export type DeleteAccountResponse = void
