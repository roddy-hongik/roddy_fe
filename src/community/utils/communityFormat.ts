const toValidDate = (value: string) => {
  const date = new Date(value)

  return Number.isFinite(date.getTime()) ? date : null
}

export const formatCommunityDate = (isoDate: string) => {
  const date = toValidDate(isoDate)

  if (!date) {
    return ''
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatCommunityDateTime = (isoDate: string) => {
  const date = toValidDate(isoDate)

  if (!date) {
    return ''
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCommunityCount = (count: number) => count.toLocaleString('ko-KR')

export const normalizeTagInput = (rawValue: string) =>
  Array.from(
    new Set(
      rawValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  )
