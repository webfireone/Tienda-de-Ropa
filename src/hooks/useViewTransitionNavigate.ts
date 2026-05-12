import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { flushSync } from "react-dom"

export function useViewTransitionNavigate() {
  const navigate = useNavigate()

  const navigateWithTransition = useCallback(
    (to: string, options?: { replace?: boolean; state?: unknown }) => {
      if (!document.startViewTransition) {
        navigate(to, options)
        return
      }

      document.startViewTransition(() => {
        flushSync(() => {
          navigate(to, options)
        })
      })
    },
    [navigate],
  )

  return navigateWithTransition
}
