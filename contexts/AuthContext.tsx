import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { IUser } from '../models/user.model'
import { connect, disconnect } from '../utils/database/database'
import Octokit from '../utils/octokit/octokit'

interface IAuthContext {
  isReady: boolean
  isAuthenticated: boolean
  user: IUser | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<IAuthContext>({
  isReady: false,
  isAuthenticated: false,
  user: null,
  login: async () => { },
  logout: async () => { },
})

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<IAuthContext['user']>(null)

  useEffect(() => {
    async function prepare() {
      const token = await AsyncStorage.getItem('github_token')

      if (token) {
        const octokit = new Octokit({ auth: token })
        const user = await octokit.users.getAuthenticatedUser()

        connect(token)
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
      }
    }

    prepare()
      .catch((err) => console.error(err))
      .finally(() => setIsReady(true))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isReady: isReady,
        isAuthenticated: !!user,
        user: user,

        login: async (token) => {
          const octokit = new Octokit({ auth: token })
          const user = await octokit.users.getAuthenticatedUser()

          connect(token)
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
          return AsyncStorage.setItem('github_token', token)
        },

        logout: async () => {
          disconnect()
          setUser(null)
          return AsyncStorage.removeItem('github_token')
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}