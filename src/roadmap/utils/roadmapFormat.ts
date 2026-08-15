export const formatRoadmapDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

export const formatRoadmapDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
