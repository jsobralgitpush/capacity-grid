import type { SortColumn } from './CapacityGridWeek.types'

export const columns: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'capacity', label: 'Capacity (h/week)' },
  { key: 'allocation', label: 'Allocation (h)' },
  { key: 'status', label: 'Status' },
]
export const statusOrder = { below_capacity: 0, at_capacity: 1, over_capacity: 2 }
export const statusLabels = {
  below_capacity: 'Below capacity',
  at_capacity: 'At capacity',
  over_capacity: 'Over capacity',
}
export const PAGE_SIZE = 10

