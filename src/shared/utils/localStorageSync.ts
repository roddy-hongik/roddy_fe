export const RODDY_DATA_CHANGE_EVENT = 'roddy:data-change'

type RoddyDataChangeDetail = {
  key: string
}

export function emitRoddyDataChange(key: string) {
  window.dispatchEvent(new CustomEvent<RoddyDataChangeDetail>(RODDY_DATA_CHANGE_EVENT, { detail: { key } }))
}

export function parseStoredJson<T>(rawValue: string | null, fallbackValue: T): T {
  if (!rawValue) {
    return fallbackValue
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return fallbackValue
  }
}

export function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
