export type CapacityRow = {
  id: number
  name: string
  capacity: number
  allocation: number
  status: 'below_capacity' | 'at_capacity' | 'over_capacity'
  week_start: string
  week_end: string
}
