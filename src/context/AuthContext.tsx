/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword as fbSignIn,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, Role } from "@/types"
import { MOCK_USER } from "@/lib/constants"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

interface AuthContextType {
  user: User | null
  role: Role
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setMockRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType>({
  user: USE_MOCK ? MOCK_USER : null,
  role: USE_MOCK ? "admin" : "viewer",
  isAdmin: USE_MOCK,
  loading: false,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  setMockRole: () => {},
})

const ADMIN_EMAILS = ["admin@tiendaropa.com", "tiendaderopa@admin.com"]

async function getUserRole(uid: string, email?: string): Promise<Role> {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return "admin"
  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (snap.exists()) return snap.data().role || "viewer"
    await setDoc(doc(db, "users", uid), { role: "viewer" })
    return "viewer"
  } catch {
    return "viewer"
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(() => USE_MOCK ? MOCK_USER : null)
  const [loading, setLoading] = useState(true)

  const [mockRole, setMockRoleState] = useState<Role>("admin")

  const resolvedUser: User | null = USE_MOCK
    ? userData ?? { ...MOCK_USER, role: mockRole }
    : userData

  useEffect(() => {
    if (USE_MOCK) return

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const role = await getUserRole(fbUser.uid, fbUser.email || undefined)
        setUserData({
          uid: fbUser.uid,
          email: fbUser.email || "",
          role,
        })
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    if (USE_MOCK) {
      setUserData({ uid: "mock-uid", email, role: "viewer" })
      return
    }
    const cred = await fbSignIn(auth, email, password)
    const role = await getUserRole(cred.user.uid, cred.user.email || undefined)
    setUserData({
      uid: cred.user.uid,
      email: cred.user.email || "",
      role,
    })
  }

  const signInWithGoogle = async () => {
    if (USE_MOCK) {
      setUserData({ uid: "mock-uid", email: "cliente@mock.com", role: "viewer" })
      return
    }
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const role = await getUserRole(cred.user.uid, cred.user.email || undefined)
    setUserData({
      uid: cred.user.uid,
      email: cred.user.email || "",
      role,
    })
  }

  const signOut = async () => {
    if (USE_MOCK) {
      setUserData(null)
      return
    }
    await fbSignOut(auth)
    setUserData(null)
  }

  const setMockRole = (role: Role) => {
    setMockRoleState(role)
    setUserData(prev => prev ? { ...prev, role } : null)
  }

  const resolvedRole = resolvedUser?.role ?? "viewer"
  const resolvedIsAdmin = resolvedRole === "admin"

  const value = {
    user: resolvedUser,
    role: resolvedRole,
    isAdmin: resolvedIsAdmin,
    loading: USE_MOCK ? false : loading,
    signIn,
    signInWithGoogle,
    signOut,
    setMockRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
