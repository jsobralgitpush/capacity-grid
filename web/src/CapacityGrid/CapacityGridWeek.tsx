import type { CapacityRow } from './CapacityGrid.types'
import type { CapacityGridWeekProps } from './CapacityGridWeek.types'
import { columns, statusLabels } from './CapacityGridWeek.constants'
import { hours } from './CapacityGridWeek.utils'
import { useCapacityGridWeekContainer } from './CapacityGridWeek.useContainer'

export function CapacityGridWeek({ week, editor, idPrefix }: CapacityGridWeekProps) {
  const {
    statusFilter, sortColumn, sortDirection, editingThisWeek, label, headingID,
    visibleRows, totalRows, page, pageCount, firstRecord, lastRecord,
    changeSort, changeStatusFilter, previousPage, nextPage,
  } = useCapacityGridWeekContainer({ week, editor, idPrefix })

  return (
    <section className="week-group" aria-labelledby={headingID}>
      <h2 id={headingID}>{label}</h2>
      <div className="week-controls">
        <label>
          Status
          <select value={statusFilter} disabled={editingThisWeek} aria-label={`Status for ${label}`} onChange={event => changeStatusFilter(event.target.value as CapacityRow['status'] | '')}>
            <option value="">All statuses</option>
            <option value="below_capacity">Below capacity</option>
            <option value="at_capacity">At capacity</option>
            <option value="over_capacity">Over capacity</option>
          </select>
        </label>
      </div>
      <div className="table-container">
        <table className="capacity-grid" aria-labelledby={headingID}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} scope="col" aria-sort={sortColumn === column.key ? sortDirection : 'none'}>
                  <button className="sort-button" type="button" disabled={editingThisWeek} onClick={() => changeSort(column.key)}
                    aria-label={`Sort by ${column.label}, ${sortColumn === column.key && sortDirection === 'ascending' ? 'descending' : 'ascending'}`}>
                    {column.label}{' '}
                    <span aria-hidden="true">{sortColumn === column.key ? (sortDirection === 'ascending' ? '↑' : '↓') : '↕'}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(row => (
              <tr key={row.id} className={row.status}>
                <th scope="row">{row.name}</th>
                <td>
                  {editingThisWeek && editor.row?.id === row.id ? (
                    <form className="capacity-editor" onSubmit={editor.onSubmit}>
                      <label>
                        Weekly hours
                        <input type="number" min="0" max="168" step="any" required value={editor.draft}
                          autoFocus aria-label={`Weekly capacity for ${row.name}`}
                          onFocus={event => event.target.select()}
                          disabled={editor.saving || editor.saved} onChange={event => editor.onDraftChange(event.target.value)} />
                      </label>
                      <small>Applies to all weeks for this person.</small>
                      <div className="capacity-editor-actions">
                        <button type="submit" disabled={editor.saving}>{editor.saving ? 'Saving…' : editor.saved ? 'Retry refresh' : 'Save'}</button>
                        {!editor.saved && <button type="button" disabled={editor.saving} onClick={editor.onCancel}>Cancel</button>}
                      </div>
                      {editor.error && <p role="alert">{editor.error}</p>}
                    </form>
                  ) : (
                    <>
                      {hours.format(row.capacity)}{' '}
                      <button type="button" disabled={editor.saving || editor.row !== null}
                        aria-label={`Edit weekly capacity for ${row.name}`} onClick={() => editor.onEdit(row)}>Edit</button>
                    </>
                  )}
                </td>
                <td>{hours.format(row.allocation)}</td>
                <td>{statusLabels[row.status]}</td>
              </tr>
            ))}
            {totalRows === 0 && <tr><td colSpan={4}>No people match this status in this week.</td></tr>}
          </tbody>
        </table>
      </div>
      {totalRows > 0 && (
        <nav className="pagination" aria-label={`Pagination for ${label}`}>
          <button type="button" disabled={page === 1 || editingThisWeek} onClick={previousPage}>Previous</button>
          <span role="status">
            {firstRecord}–{lastRecord} of {totalRows} people · Page {page} of {pageCount}
          </span>
          <button type="button" disabled={page === pageCount || editingThisWeek} onClick={nextPage}>Next</button>
        </nav>
      )}
    </section>
  )
}
