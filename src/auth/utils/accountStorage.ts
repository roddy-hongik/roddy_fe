const ANONYMOUS_ACCOUNT_ID = 'anonymous'
const ACCOUNT_ID_KEY = 'authAccountId'

const tokenFingerprint = (token: string) => {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `token-${(hash >>> 0).toString(36)}`
}

const readJwtUserId = (token: string) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as {
      userId?: string | number
    }
    return decoded.userId === undefined || decoded.userId === null ? null : String(decoded.userId)
  } catch {
    return null
  }
}

export function createAccountStorageId(accessToken: string) {
  const userId = readJwtUserId(accessToken)
  return userId ? `user-${userId}` : tokenFingerprint(accessToken)
}

export function storeCurrentAccountStorageId(accountId: string) {
  localStorage.setItem(ACCOUNT_ID_KEY, accountId)
}

export function getCurrentAccountStorageId() {
  const stored = localStorage.getItem(ACCOUNT_ID_KEY)
  if (stored) return stored

  // 이전 버전에서 로그인한 세션도 첫 접근부터 계정별 캐시를 사용하게 한다.
  const accessToken = localStorage.getItem('accessToken')
  if (!accessToken) return ANONYMOUS_ACCOUNT_ID

  const accountId = createAccountStorageId(accessToken)
  storeCurrentAccountStorageId(accountId)
  return accountId
}

export function clearCurrentAccountStorageId() {
  localStorage.removeItem(ACCOUNT_ID_KEY)
}
