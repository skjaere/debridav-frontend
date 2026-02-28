import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiFetch, getToken, setToken, clearToken, setUnauthorizedHandler } from '../lib/api'
import type { LoginRequest, LoginResponse } from '../types/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  const logout = useCallback(() => {
    clearToken()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    setToken(data.token)
    setIsAuthenticated(true)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
