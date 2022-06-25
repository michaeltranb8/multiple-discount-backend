export function getYesterday() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

export function getTomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date
}
