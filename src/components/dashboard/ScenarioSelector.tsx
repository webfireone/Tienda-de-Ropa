import { useParams } from "@/context/ParamsContext"
import { Select } from "@/components/ui/select"
import { SCENARIOS } from "@/lib/constants"
import type { Scenario } from "@/types"

export function ScenarioSelector() {
  const { scenario, setScenario } = useParams()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Escenario:</span>
      <Select
        value={scenario}
        onChange={(e) => setScenario(e.target.value as Scenario)}
        options={Object.entries(SCENARIOS).map(([k, v]) => ({
          value: k,
          label: v.label,
        }))}
        className="w-40"
      />
    </div>
  )
}
