export interface ProfileSummary {
  name: string
  age: number
  imageUrl: string | null
  targetRole?: string
  targetIndustry?: string
}

export interface UpdateProfilePayload {
  name: string
  age: number
  imageBase64?: string | null
}

export interface ReanalyzePayload {
  reportTitle: string
  portfolioFileName: string
  categories: string[]
  preferredCompanies: string[]
}

export interface DeleteAccountResponse {
  success: boolean
}
