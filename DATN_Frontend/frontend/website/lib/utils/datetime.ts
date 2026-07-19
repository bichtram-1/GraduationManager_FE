const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const toDate = (value: string | number | Date): Date => {
  if (value instanceof Date) return value
  return new Date(value)
}

export const formatVietnamTimeDate = (value: string | number | Date): string => {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date)

  const day = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date)

  return `${time} - ${day}`
}

export const formatVietnamDateTime = (value: string | number | Date): string => {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date)
}

export const formatVietnamDate = (value: string | number | Date): string => {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date)
}

export const formatVietnamDateTimeAmPm = (value: string | number | Date): string => {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: true,
    timeZone: VIETNAM_TIME_ZONE,
  })
    .format(date)
    .replace(',', '')
}
