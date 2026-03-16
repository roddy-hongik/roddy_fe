export const formatCommunityDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

export const formatCommunityDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

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
