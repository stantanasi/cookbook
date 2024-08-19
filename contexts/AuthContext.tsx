import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'

interface IAuthContext {
  isReady: boolean
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<IAuthContext>({
  isReady: false,
  token: null,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
})

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [token, setToken] = useState<IAuthContext['token']>(null)

  useEffect(() => {
    AsyncStorage.getItem('github_token')
      .then((value) => setToken(value))
      .finally(() => setIsReady(true))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isReady: isReady,
        token: token,
        isAuthenticated: !!token,

        login: async (token) => {
          setToken(token)
          return AsyncStorage.setItem('github_token', token)
        },

        logout: async () => {
          setToken(null)
          return AsyncStorage.removeItem('github_token')
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}