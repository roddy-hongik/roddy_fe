import { getCurrentAccountStorageId } from '../../auth/utils/accountStorage'
import type { ProfileSummary } from '../types/profile'

const cacheKey = () => `profileCache:${getCurrentAccountStorageId()}`

export function readProfileCache(): ProfileSummary | null {
  try {
    const value = localStorage.getItem(cacheKey())
    return value ? (JSON.parse(value) as ProfileSummary) : null
  } catch {
    return null
  }
}

export function writeProfileCache(profile: ProfileSummary) {
  localStorage.setItem(cacheKey(), JSON.stringify(profile))
}

export function updateProfileCache(patch: Partial<ProfileSummary>) {
  const current = readProfileCache()
  if (current) writeProfileCache({ ...current, ...patch })
}

export function clearProfileCache() {
  localStorage.removeItem(cacheKey())
}
