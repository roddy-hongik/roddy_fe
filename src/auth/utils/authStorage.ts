import type { LoginResponse, TokenPair } from '../../api/types/auth'
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

/** 닉네임이 비어 있는 계정도 있어서 이메일 앞부분, 그다음 '사용자' 순으로 채운다. */
const toDisplayName = (user: LoginResponse['user'] | undefined) =>
  user?.nickname?.trim() || user?.email?.split('@')[0]?.trim() || '사용자'

export const isAdminSession = () => localStorage.getItem(USER_ROLE_KEY) === 'admin'

export const readTokenPair = (): TokenPair | null => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  return accessToken && refreshToken ? { accessToken, refreshToken } : null
}

export const storeAuthSession = (payload: LoginResponse) => {
  clearAuthSession()
  LEGACY_PROFILE_KEYS.forEach((key) => localStorage.removeItem(key))
  storeCurrentAccountStorageId(createAccountStorageId(payload.accessToken))
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  localStorage.setItem(USER_NAME_KEY, toDisplayName(payload.user))
  localStorage.setItem(USER_ROLE_KEY, toStoredRole(payload.role))
  localStorage.setItem(IS_ONBOARD_KEY, String(payload.isOnboard))
  localStorage.setItem(GITHUB_CONNECTED_KEY, String(payload.githubConnected))
}

/** 재발급은 같은 계정의 토큰만 바꾼다. 이름·권한·계정 캐시 키는 그대로 둔다. */
export const storeReissuedTokens = (tokens: TokenPair) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export const markOnboardingCompleted = () => {
  localStorage.setItem(IS_ONBOARD_KEY, 'true')
}

export const markGithubConnected = (value: boolean) => {
  localStorage.setItem(GITHUB_CONNECTED_KEY, String(value))
}

export const isOnboarded = () => readBooleanStorage(IS_ONBOARD_KEY)

export const isGithubConnected = () => readBooleanStorage(GITHUB_CONNECTED_KEY)
