import type { FormEvent } from 'react'
import type { CapacityRow } from './CapacityGrid.types'

export type SortColumn = 'name' | 'capacity' | 'allocation' | 'status'

export type CapacityGridWeekProps = {
  idPrefix?: string
  week: { start: string; end: string; rows: CapacityRow[] }
  editor: {
    row: CapacityRow | null
    draft: string
    saving: boolean
    saved: boolean
    error: string
    onDraftChange: (value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    onCancel: () => void
    onEdit: (row: CapacityRow) => void
  }
}
