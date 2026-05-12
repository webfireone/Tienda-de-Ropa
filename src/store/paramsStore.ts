import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GlobalParams, Scenario } from "@/types"
import { DEFAULT_PARAMS, SCENARIOS } from "@/lib/constants"
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ParamsStore {
  params: GlobalParams
  updateParams: (params: GlobalParams) => void
  scenario: Scenario
  setScenario: (s: Scenario) => void
  scenarioConfig: typeof SCENARIOS[string]
  initFirestoreSync: () => (() => void) | undefined
  saveToFirestore: () => Promise<void>
}

const PARAMS_DOC = "siteConfig/params"

export const useParamsStore = create<ParamsStore>()(
  persist(
    (set, get) => ({
      params: DEFAULT_PARAMS,
      scenario: "base",
      scenarioConfig: SCENARIOS.base,

      updateParams: (newParams) => set({ params: newParams }),

      setScenario: (scenario) =>
        set({
          scenario,
          scenarioConfig: SCENARIOS[scenario],
        }),

      initFirestoreSync: () => {
        const isFirestoreAvailable =
          import.meta.env.VITE_FIREBASE_API_KEY &&
          import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key"

        if (!isFirestoreAvailable) return

        const ref = doc(db, PARAMS_DOC)
        const unsub = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as { config?: Partial<GlobalParams>; updatedAt?: unknown }
              if (data.config) {
                set((state) => ({
                  params: { ...state.params, ...data.config },
                }))
              }
            }
          },
          () => {}
        )
        return unsub
      },

      saveToFirestore: async () => {
        const isFirestoreAvailable =
          import.meta.env.VITE_FIREBASE_API_KEY &&
          import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key"
        if (!isFirestoreAvailable) return
        try {
          await setDoc(
            doc(db, PARAMS_DOC),
            { config: get().params, updatedAt: serverTimestamp() },
            { merge: true }
          )
        } catch {
          // silent fail
        }
      },
    }),
    {
      name: "gl-amours-params",
      partialize: (state) => ({ params: state.params }),
    }
  )
)
