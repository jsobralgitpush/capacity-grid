import { CapacityGridWeek } from './CapacityGridWeek'
import { useCapacityGridContainer } from './CapacityGrid.useContainer'
import { addDays, weekLabel } from './CapacityGrid.utils'

export function CapacityGrid() {
  const {
    from, to, weeks, weekCount, availableWeeks, weekGroups,
    loading, saving, error, notice, valid, unfiltered, filtersDisabled,
    selectStartingWeek, selectWeekCount, clearFilters, editor,
  } = useCapacityGridContainer()

  return (
    <section aria-label="Capacity" aria-busy={loading || saving}>
      <div className="filters">
        <label>
          Starting week
          <select value={from} disabled={filtersDisabled || availableWeeks.length === 0} onChange={event => selectStartingWeek(event.target.value)}>
            <option value="">All available weeks</option>
            {availableWeeks.map(week => <option key={week.start} value={week.start}>{weekLabel(week.start, week.end)}</option>)}
          </select>
        </label>
        <label>
          Show
          <select value={weekCount} disabled={!from || filtersDisabled} onChange={event => selectWeekCount(event.target.value)}>
            <option value="" disabled>Select number of weeks</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(count => (
              <option key={count} value={count}>{count} {count === 1 ? 'week' : 'weeks'}</option>
            ))}
          </select>
        </label>
        {!unfiltered && <button type="button" disabled={filtersDisabled} onClick={clearFilters}>Clear filters</button>}
        {notice && <p className="filter-notice" role="status">{notice}</p>}
      </div>
      {!unfiltered && !valid ? <p role="alert">Choose a starting week and the number of weeks to show.</p> : (
        <>
          <p className="range">
            {unfiltered ? 'Showing all weeks with assignments.' : `Showing ${weekLabel(from, addDays(to, -1))} · ${weeks} ${weeks === 1 ? 'week' : 'weeks'}.`}
            {' '}Each table shows one week. Allocation counts Monday–Friday.
          </p>
          {loading ? <p role="status">Loading capacity… Filters will be available when loading finishes.</p> : error ? <p role="alert">{error}</p> : (
            <div className="week-tables">
              {weekGroups.map(week => (
                <CapacityGridWeek key={week.start} week={week} editor={editor} />
              ))}
              {weekGroups.length === 0 && <p>No capacity records found.</p>}
            </div>
          )}
        </>
      )}
    </section>
  )
}
