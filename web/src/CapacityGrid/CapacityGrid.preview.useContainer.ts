import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CapacityRow } from './CapacityGrid.types'
import type { CapacityGridWeekProps } from './CapacityGridWeek.types'
import type { CapacityPreviewState } from './CapacityGrid.preview.types'
import { previewWeek } from './CapacityGrid.preview.constants'

export function useCapacityGridPreviewContainer() {
  const [state, setState] = useState<CapacityPreviewState>('loaded')
  const [person, setPerson] = useState(previewWeek.rows[0])
  const [draft, setDraft] = useState('32')
  const editing = state === 'editing' || state === 'saving' || state === 'save-error'

  function selectState(next: CapacityPreviewState) {
    setState(next)
    setPerson(previewWeek.rows[0])
    setDraft('32')
  }

  const editor: CapacityGridWeekProps['editor'] = {
    row: editing ? person : null,
    draft,
    saving: state === 'saving',
    saved: false,
    error: state === 'save-error' ? 'Could not confirm the save. Check your connection and try again.' : '',
    onDraftChange: setDraft,
    onCancel: () => setState('loaded'),
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setState('saving')
    },
    onEdit: (row: CapacityRow) => {
      setPerson(row)
      setDraft(String(row.capacity))
      setState('editing')
    },
  }

  return { state, selectState, editor }
}
