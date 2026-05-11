import { create } from "zustand"
import type { GlobalParams, Scenario } from "@/types"
import { DEFAULT_PARAMS, SCENARIOS } from "@/lib/constants"

interface ParamsStore {
  params: GlobalParams
  updateParams: (params: GlobalParams) => void
  scenario: Scenario
  setScenario: (s: Scenario) => void
  scenarioConfig: typeof SCENARIOS[string]
}

export const useParamsStore = create<ParamsStore>((set) => ({
  params: DEFAULT_PARAMS,
  scenario: "base",
  scenarioConfig: SCENARIOS.base,
  
  updateParams: (newParams) => set({ params: newParams }),
  
  setScenario: (scenario) => set({ 
    scenario, 
    scenarioConfig: SCENARIOS[scenario] 
  }),
}))
