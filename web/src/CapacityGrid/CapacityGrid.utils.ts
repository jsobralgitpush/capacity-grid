import { MILLISECONDS_PER_DAY } from './CapacityGrid.constants'

const dates = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date) + days * MILLISECONDS_PER_DAY).toISOString().slice(0, 10)
}

export function weekLabel(start: string, end: string): string {
  return `${dates.format(new Date(start))} – ${dates.format(new Date(end))}`
}

export async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed (HTTP ${response.status}).`)
  }
  return response.json() as Promise<T>
}
