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

const toValidDate = (value: string) => {
  if (!value.trim()) {
    return null
  }

  const date = new Date(value)

  return Number.isFinite(date.getTime()) ? date : null
}

export function formatDateLabel(value: string) {
  const date = toValidDate(value)

  if (!date) {
    return ''
  }

  return dateFormatter.format(date)
}

export function formatDateTimeLabel(value: string) {
  const date = toValidDate(value)

  if (!date) {
    return ''
  }

  return dateTimeFormatter.format(date)
}
