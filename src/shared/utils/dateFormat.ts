const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTimeLabel(value: string) {
  return dateTimeFormatter.format(new Date(value))
}
