import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import Octokit from '../utils/octokit/octokit'
import { IUser } from '../models/user.model'

interface IAuthContext {
  isReady: boolean
  token: string | null
  isAuthenticated: boolean
  user: IUser | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<IAuthContext>({
  isReady: false,
  token: null,
  isAuthenticated: false,
  user: null,
  login: async () => { },
  logout: async () => { },
})

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [token, setToken] = useState<IAuthContext['token']>(null)
  const [user, setUser] = useState<IAuthContext['user']>(null)

  useEffect(() => {
    AsyncStorage.getItem('github_token')
      .then((value) => setToken(value))
      .finally(() => setIsReady(true))
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    const octokit = new Octokit({ auth: token })
    octokit.users.getAuthenticatedUser()
      .then((user) => {
        setUser({
          id: user.id,
          pseudo: user.login,
          avatar: user.avatar_url,
          name: user.name,
          bio: user.bio,
          location: user.location,
          company: user.company,
          followers: user.followers,
          following: user.following,
          url: user.html_url,
        })
      })
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        isReady: isReady,
        token: token,
        isAuthenticated: !!token,
        user: user,

        login: async (token) => {
          const octokit = new Octokit({ auth: token })
          return octokit.users.getAuthenticatedUser()
            .then(() => {
              setToken(token)
              return AsyncStorage.setItem('github_token', token)
            })
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