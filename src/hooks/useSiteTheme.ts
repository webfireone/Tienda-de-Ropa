import { useEffect, useRef, useState } from "react"
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { FullThemeConfig } from "@/store/bellezaStore"

const THEME_DOC = "siteConfig/theme"
const LS_KEY = "belleza-active-config"

interface SiteThemeDoc {
  config: FullThemeConfig
  updatedAt: any
  updatedBy?: string
}

export function useSiteTheme() {
  const [themeFromFirestore, setThemeFromFirestore] = useState<
    FullThemeConfig | null
  >(null)
  const [loading, setLoading] = useState(true)
  const unsubRef = useRef<(() => void) | null>(null)
  const isFirestoreAvailable =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key"

  useEffect(() => {
    if (!isFirestoreAvailable) {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setThemeFromFirestore(parsed)
        } catch {
          setThemeFromFirestore(null)
        }
      }
      setLoading(false)
      return
    }

    const themeRef = doc(db, THEME_DOC)
    unsubRef.current = onSnapshot(
      themeRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SiteThemeDoc
          if (data.config) {
            setThemeFromFirestore(data.config)
            localStorage.setItem(LS_KEY, JSON.stringify(data.config))
          }
        }
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )

    return () => {
      unsubRef.current?.()
    }
  }, [isFirestoreAvailable])

  const saveSiteTheme = async (
    config: FullThemeConfig,
    userEmail?: string
  ): Promise<boolean> => {
    if (!isFirestoreAvailable) return false
    try {
      await setDoc(
        doc(db, THEME_DOC),
        {
          config,
          updatedAt: serverTimestamp(),
          updatedBy: userEmail || null,
        },
        { merge: true }
      )
      return true
    } catch {
      return false
    }
  }

  return {
    themeFromFirestore,
    loading,
    saveSiteTheme,
    isFirestoreAvailable,
  }
}
