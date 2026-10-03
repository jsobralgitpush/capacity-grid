import { CapacityGrid } from './CapacityGrid/CapacityGrid'
import { CapacityGridPreview } from './CapacityGrid/CapacityGrid.preview'

export function App() {
  return (
    <main>
      <h1>Team capacity</h1>
      <CapacityGridPreview />
      <CapacityGrid />
    </main>
  )
}
