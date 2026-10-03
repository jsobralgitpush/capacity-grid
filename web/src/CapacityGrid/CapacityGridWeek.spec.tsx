import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { CapacityGridWeek } from './CapacityGridWeek'
import type { CapacityRow } from './CapacityGrid.types'
import type { CapacityGridWeekProps } from './CapacityGridWeek.types'

afterEach(cleanup)

it('keeps sorting, pagination, and status filtering independent between weeks', () => {
  function makeRows(start: string, end: string): CapacityRow[] {
    return Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: `Person ${String(index + 1).padStart(2, '0')}`,
      capacity: 40,
      allocation: index < 6 ? 20 : 50,
      status: index < 6 ? 'below_capacity' : 'over_capacity',
      week_start: start,
      week_end: end,
    }))
  }
  const editor: CapacityGridWeekProps['editor'] = {
    row: null,
    draft: '',
    saving: false,
    saved: false,
    error: '',
    onDraftChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    onEdit: vi.fn(),
  }
  const { getAllByRole } = render(
    <>
      <CapacityGridWeek week={{ start: '2026-01-05', end: '2026-01-11', rows: makeRows('2026-01-05', '2026-01-11') }} editor={editor} />
      <CapacityGridWeek week={{ start: '2026-01-12', end: '2026-01-18', rows: makeRows('2026-01-12', '2026-01-18') }} editor={editor} />
    </>,
  )
  const [firstTable, secondTable] = getAllByRole('table')
  const [firstWeek, secondWeek] = getAllByRole('region')
  const names = (table: HTMLElement) => within(table).getAllByRole('rowheader').map(cell => cell.textContent)
  const originalFirstPage = names(firstTable)
  expect(originalFirstPage).toHaveLength(10)

  fireEvent.click(within(secondTable).getByRole('button', { name: 'Sort by Name, descending' }))
  expect(names(secondTable)[0]).toBe('Person 12')
  expect(names(firstTable)).toEqual(originalFirstPage)

  fireEvent.click(within(secondWeek).getByRole('button', { name: 'Next' }))
  expect(names(secondTable)).toEqual(['Person 02', 'Person 01'])
  expect(names(firstTable)).toEqual(originalFirstPage)
  expect(within(firstWeek).getByRole('status').textContent).toContain('Page 1 of 2')

  fireEvent.change(within(secondWeek).getByRole('combobox'), { target: { value: 'below_capacity' } })
  expect(names(secondTable)).toEqual(['Person 06', 'Person 05', 'Person 04', 'Person 03', 'Person 02', 'Person 01'])
  expect(within(secondWeek).getByRole('status').textContent).toContain('Page 1 of 1')
  expect(names(firstTable)).toEqual(originalFirstPage)
  expect((within(firstWeek).getByRole('combobox') as HTMLSelectElement).value).toBe('')
})
