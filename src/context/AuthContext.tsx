import { createContext, useContext, useState, type ReactNode } from "react"
import type { User, Role } from "@/types"
import { MOCK_USER } from "@/lib/constants"

interface AuthContextType {
  user: User | null
  role: Role
  isAdmin: boolean
  setMockRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType>({
  user: MOCK_USER,
  role: "admin",
  isAdmin: true,
  setMockRole: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER)

  const setMockRole = (role: Role) => {
    setUser(prev => ({ ...prev, role }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAdmin: user.role === "admin",
        setMockRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
