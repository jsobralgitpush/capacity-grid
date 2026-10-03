import { useMemo, useState } from 'react'
import type { CapacityRow } from './CapacityGrid.types'
import type { CapacityGridWeekProps, SortColumn } from './CapacityGridWeek.types'
import { PAGE_SIZE, statusOrder } from './CapacityGridWeek.constants'
import { weekLabel } from './CapacityGrid.utils'

export function useCapacityGridWeekContainer({ week, editor, idPrefix = '' }: CapacityGridWeekProps) {
  const [statusFilter, setStatusFilter] = useState<CapacityRow['status'] | ''>('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending')
  const [requestedPage, setRequestedPage] = useState(1)
  const editingThisWeek = editor.row?.week_start === week.start
  const label = weekLabel(week.start, week.end)
  const headingID = `${idPrefix}week-${week.start}`

  const sortedRows = useMemo(() => {
    const filtered = week.rows.filter(row => !statusFilter || row.status === statusFilter)
    return filtered.sort((a, b) => {
      let comparison: number
      if (sortColumn === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortColumn === 'status') comparison = statusOrder[a.status] - statusOrder[b.status]
      else comparison = a[sortColumn] - b[sortColumn]
      return (sortDirection === 'ascending' ? comparison : -comparison)
        || a.name.localeCompare(b.name) || a.id - b.id
    })
  }, [week.rows, statusFilter, sortColumn, sortDirection])

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount)
  const offset = (page - 1) * PAGE_SIZE
  const visibleRows = sortedRows.slice(offset, offset + PAGE_SIZE)

  function changeSort(column: SortColumn) {
    if (editingThisWeek) return
    setRequestedPage(1)
    if (column === sortColumn) {
      setSortDirection(current => current === 'ascending' ? 'descending' : 'ascending')
    } else {
      setSortColumn(column)
      setSortDirection('ascending')
    }
  }

  function changeStatusFilter(value: CapacityRow['status'] | '') {
    if (editingThisWeek) return
    setStatusFilter(value)
    setRequestedPage(1)
  }

  function previousPage() {
    if (!editingThisWeek && page > 1) setRequestedPage(page - 1)
  }

  function nextPage() {
    if (!editingThisWeek && page < pageCount) setRequestedPage(page + 1)
  }

  return {
    statusFilter, sortColumn, sortDirection, editingThisWeek, label, headingID,
    visibleRows, totalRows: sortedRows.length, page, pageCount,
    firstRecord: offset + 1,
    lastRecord: Math.min(offset + PAGE_SIZE, sortedRows.length),
    changeSort, changeStatusFilter, previousPage, nextPage,
  }
}
