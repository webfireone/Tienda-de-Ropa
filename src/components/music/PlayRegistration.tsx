import { useEffect } from "react"
import { setPlayThresholdCb } from "@/store/musicStore"
import { useRegistrarReproduccion } from "@/hooks/useMusic"

export function PlayRegistration() {
  const registrarReproduccion = useRegistrarReproduccion()

  useEffect(() => {
    setPlayThresholdCb((songId) => {
      registrarReproduccion.mutate(songId)
    })
  }, [registrarReproduccion])

  return null
}
