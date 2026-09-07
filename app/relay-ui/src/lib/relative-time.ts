export function formatRelative(updated: string): string {
  const then = Date.parse(updated)
  if (Number.isNaN(then)) return updated
  const minutes = Math.floor((Date.now() - then) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return `há ${Math.floor(hours / 24)} d`
}
