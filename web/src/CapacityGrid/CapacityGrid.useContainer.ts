import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { CapacityRow } from './CapacityGrid.types'
import { DAYS_PER_WEEK } from './CapacityGrid.constants'
import { addDays, readResponse } from './CapacityGrid.utils'

export function useCapacityGridContainer() {
  const [from, setFrom] = useState('')
  const [weekCount, setWeekCount] = useState('')
  const [availableWeeks, setAvailableWeeks] = useState<{ start: string; end: string }[]>([])
  const [rows, setRows] = useState<CapacityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<CapacityRow | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const busy = useRef(false)
  const weeks = Number(weekCount)
  const valid = Boolean(from) && Number.isInteger(weeks) && weeks >= 1 && weeks <= 10
  const unfiltered = !from && !weekCount
  const to = valid ? addDays(from, weeks * DAYS_PER_WEEK) : ''
  const filtersDisabled = loading || saving || (saved && editing !== null)

  const weekGroups = useMemo(() => {
    const groups = new Map<string, { start: string; end: string; rows: CapacityRow[] }>()
    for (const row of rows) {
      let group = groups.get(row.week_start)
      if (!group) {
        group = { start: row.week_start, end: row.week_end, rows: [] }
        groups.set(row.week_start, group)
      }
      group.rows.push(row)
    }
    return [...groups.values()].sort((a, b) => a.start.localeCompare(b.start))
  }, [rows])

  useEffect(() => {
    if (!valid && !unfiltered) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch(unfiltered ? '/api/capacity' : `/api/capacity?${new URLSearchParams({ from, to })}`, {
      signal: controller.signal,
    })
      .then(response => readResponse<CapacityRow[]>(response))
      .then(data => {
        if (!controller.signal.aborted) {
          setRows(data)
          if (unfiltered) {
            const weekMap = new Map(data.map(row => [row.week_start, row.week_end]))
            setAvailableWeeks([...weekMap].sort(([a], [b]) => a.localeCompare(b)).map(([start, end]) => ({ start, end })))
          }
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setError(error instanceof Error ? error.message : 'Could not load capacity.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [from, to, valid, unfiltered])

  async function saveCapacity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || busy.current) return
    const capacity = Number(draft)
    if (!draft.trim() || !Number.isFinite(capacity) || capacity < 0 || capacity > 168) {
      setSaveError('Weekly hours must be between 0 and 168.')
      return
    }
    busy.current = true
    setSaving(true)
    setSaveError('')
    setNotice('')
    let didSave = saved
    try {
      if (!didSave) {
        await readResponse(await fetch(`/api/people/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weekly_hours: capacity }),
        }))
        didSave = true
        setSaved(true)
      }
      const params = new URLSearchParams({ person_id: String(editing.id) })
      if (!unfiltered) {
        params.set('from', from)
        params.set('to', to)
      }
      const refreshed = await readResponse<CapacityRow[]>(await fetch(`/api/capacity?${params}`))
      const byWeek = new Map(refreshed.map(row => [row.week_start, row]))
      if (rows.some(row => row.id === editing.id && !byWeek.has(row.week_start))) {
        throw new Error('The response is missing some of this person’s weeks.')
      }
      setRows(current => current.map(row => row.id === editing.id ? (byWeek.get(row.week_start) ?? row) : row))
      setNotice(`Capacity saved and refreshed for ${editing.name}.`)
      setEditing(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Request failed.'
      setSaveError(didSave ? `Capacity was saved, but the table could not refresh. ${message}` : `Capacity was not saved. ${message}`)
    } finally {
      busy.current = false
      setSaving(false)
    }
  }


  function selectStartingWeek(value: string) {
    if (filtersDisabled || value === from) return
    setLoading(true)
    setEditing(null)
    setNotice('')
    setFrom(value)
    setWeekCount(value ? (weekCount || '1') : '')
  }

  function selectWeekCount(value: string) {
    if (filtersDisabled || value === weekCount) return
    setLoading(true)
    setEditing(null)
    setNotice('')
    setWeekCount(value)
  }

  function clearFilters() {
    if (filtersDisabled) return
    setLoading(true)
    setEditing(null)
    setNotice('')
    setFrom('')
    setWeekCount('')
  }

  function startEditing(row: CapacityRow) {
    setEditing(row)
    setDraft(String(row.capacity))
    setSaved(false)
    setSaveError('')
    setNotice('')
  }

  return {
    from, to, weeks, weekCount, availableWeeks, weekGroups,
    loading, saving, error, notice, valid, unfiltered, filtersDisabled,
    selectStartingWeek, selectWeekCount, clearFilters,
    editor: {
      row: editing,
      draft,
      saving,
      saved,
      error: saveError,
      onDraftChange: setDraft,
      onSubmit: saveCapacity,
      onCancel: () => setEditing(null),
      onEdit: startEditing,
    },
  }
}
