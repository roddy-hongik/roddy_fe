const ANONYMOUS_ACCOUNT_ID = 'anonymous'

const normalizeStorageSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function getCurrentAccountStorageId() {
  const userName = localStorage.getItem('userName')

  if (userName) {
    const normalizedUserName = normalizeStorageSegment(userName)

    if (normalizedUserName) {
      return normalizedUserName
    }
  }

  return localStorage.getItem('accessToken') ? 'session-user' : ANONYMOUS_ACCOUNT_ID
}
