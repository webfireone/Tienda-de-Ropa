import { createContext, useContext, useState, type ReactNode } from "react"
import type { GlobalParams, Scenario } from "@/types"
import { DEFAULT_PARAMS, SCENARIOS } from "@/lib/constants"

interface ParamsContextType {
  params: GlobalParams
  updateParams: (params: GlobalParams) => void
  scenario: Scenario
  setScenario: (s: Scenario) => void
  scenarioConfig: typeof SCENARIOS[string]
}

const ParamsContext = createContext<ParamsContextType>({
  params: DEFAULT_PARAMS,
  updateParams: () => {},
  scenario: "base",
  setScenario: () => {},
  scenarioConfig: SCENARIOS.base,
})

export function ParamsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<GlobalParams>(DEFAULT_PARAMS)
  const [scenario, setScenario] = useState<Scenario>("base")

  const updateParams = (newParams: GlobalParams) => {
    setParams(newParams)
  }

  return (
    <ParamsContext.Provider
      value={{
        params,
        updateParams,
        scenario,
        setScenario,
        scenarioConfig: SCENARIOS[scenario],
      }}
    >
      {children}
    </ParamsContext.Provider>
  )
}

export const useParams = () => useContext(ParamsContext)
