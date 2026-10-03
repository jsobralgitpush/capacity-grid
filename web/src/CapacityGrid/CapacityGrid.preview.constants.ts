import type { CapacityRow } from './CapacityGrid.types'
import type { CapacityPreviewState } from './CapacityGrid.preview.types'

export const previewStates: { value: CapacityPreviewState; label: string }[] = [
  { value: 'loaded', label: 'Loaded' },
  { value: 'loading', label: 'Loading' },
  { value: 'load-error', label: 'API or network failure' },
  { value: 'empty', label: 'No records' },
  { value: 'editing', label: 'Editing capacity' },
  { value: 'saving', label: 'Saving capacity' },
  { value: 'save-error', label: 'Save failure' },
  { value: 'saved', label: 'Save completed' },
]

export const previewWeek = {
  start: '2026-01-05',
  end: '2026-01-11',
  rows: [
    { id: 1, name: 'Alex (sample)', capacity: 40, allocation: 20, status: 'below_capacity' },
    { id: 2, name: 'Blair (sample)', capacity: 40, allocation: 40, status: 'at_capacity' },
    { id: 3, name: 'Casey (sample)', capacity: 40, allocation: 48, status: 'over_capacity' },
  ].map(row => ({ ...row, week_start: '2026-01-05', week_end: '2026-01-11' })) as CapacityRow[],
}
