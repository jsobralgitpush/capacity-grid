import { CapacityGridWeek } from './CapacityGridWeek'
import { previewStates, previewWeek } from './CapacityGrid.preview.constants'
import { useCapacityGridPreviewContainer } from './CapacityGrid.preview.useContainer'
import type { CapacityPreviewState } from './CapacityGrid.preview.types'

export function CapacityGridPreview() {
  const { state, selectState, editor } = useCapacityGridPreviewContainer()
  const week = state === 'saved' ? {
    ...previewWeek,
    rows: previewWeek.rows.map(row => row.id === 1 ? { ...row, capacity: 32 } : row),
  } : previewWeek

  return (
    <details className="state-preview">
      <summary>State preview</summary>
      <p>Sample data only. Select a state to preview the experience; no API requests are sent.</p>
      <label>
        Preview state
        <select value={state} onChange={event => selectState(event.target.value as CapacityPreviewState)}>
          {previewStates.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <div className="state-preview-content">
        {state === 'loading' ? (
          <p role="status">Loading capacity… Filters will be available when loading finishes.</p>
        ) : state === 'load-error' ? (
          <p className="state-error" role="alert">Could not load capacity. The API or your connection may be unavailable.</p>
        ) : state === 'empty' ? (
          <p>No capacity records found.</p>
        ) : (
          <>
            {state === 'saved' && <p role="status">Capacity saved and refreshed for Alex (sample).</p>}
            <CapacityGridWeek key={state} idPrefix="preview-" week={week} editor={editor} />
          </>
        )}
      </div>
    </details>
  )
}
