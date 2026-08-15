import type { LoginResponse } from '../../api/types/auth'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_NAME_KEY = 'userName'
const USER_ROLE_KEY = 'userRole'
const IS_ONBOARD_KEY = 'isOnboard'
const GITHUB_CONNECTED_KEY = 'githubConnected'

export const readBooleanStorage = (key: string) => localStorage.getItem(key) === 'true'

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_NAME_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
  localStorage.removeItem(IS_ONBOARD_KEY)
  localStorage.removeItem(GITHUB_CONNECTED_KEY)
}

export const storeAuthSession = (payload: LoginResponse, userName: string, userRole = 'user') => {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  localStorage.setItem(USER_NAME_KEY, userName)
  localStorage.setItem(USER_ROLE_KEY, userRole)
  localStorage.setItem(IS_ONBOARD_KEY, String(payload.isOnboard))
  localStorage.setItem(GITHUB_CONNECTED_KEY, String(payload.githubConnected))
}

export const markOnboardingCompleted = () => {
  localStorage.setItem(IS_ONBOARD_KEY, 'true')
}

export const markGithubConnected = (value: boolean) => {
  localStorage.setItem(GITHUB_CONNECTED_KEY, String(value))
}

export const isOnboarded = () => readBooleanStorage(IS_ONBOARD_KEY)

export const isGithubConnected = () => readBooleanStorage(GITHUB_CONNECTED_KEY)
