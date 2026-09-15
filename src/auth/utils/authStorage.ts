import type { LoginResponse } from '../../api/types/auth'
import {
  clearCurrentAccountStorageId,
  createAccountStorageId,
  storeCurrentAccountStorageId,
} from './accountStorage'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_NAME_KEY = 'userName'
const USER_ROLE_KEY = 'userRole'
const IS_ONBOARD_KEY = 'isOnboard'
const GITHUB_CONNECTED_KEY = 'githubConnected'
const LEGACY_PROFILE_KEYS = [
  'userAge',
  'userImageUrl',
  'userDesiredJob',
  'userPreferredCompanies',
  'userExperienceYears',
  'userPortfolioFileName',
  'userPortfolioUrl',
]

export const readBooleanStorage = (key: string) => localStorage.getItem(key) === 'true'

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_NAME_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
  localStorage.removeItem(IS_ONBOARD_KEY)
  localStorage.removeItem(GITHUB_CONNECTED_KEY)
  clearCurrentAccountStorageId()
}

/**
 * 저장은 소문자('admin' / 'user')로 한다. 화면 곳곳이 이 값과 비교한다.
 * 권한이 비어 오면 관리자로 보지 않는다.
 */
const toStoredRole = (role: LoginResponse['role'] | undefined) => (role === 'ADMIN' ? 'admin' : 'user')

export const isAdminSession = () => localStorage.getItem(USER_ROLE_KEY) === 'admin'

export const storeAuthSession = (payload: LoginResponse, userName: string) => {
  clearAuthSession()
  LEGACY_PROFILE_KEYS.forEach((key) => localStorage.removeItem(key))
  storeCurrentAccountStorageId(createAccountStorageId(payload.accessToken))
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  localStorage.setItem(USER_NAME_KEY, userName)
  localStorage.setItem(USER_ROLE_KEY, toStoredRole(payload.role))
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
