import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import User from '../models/user.model';
import AsyncStorageUtils from '../utils/async-storage.utils';
import { connect, disconnect } from '../utils/database';

interface IAuthContext {
  isReady: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<IAuthContext>({
  isReady: false,
  isAuthenticated: false,
  user: null,
  login: async () => { },
  logout: async () => { },
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<IAuthContext['user']>(null);

  useEffect(() => {
    async function prepare() {
      const token = await AsyncStorageUtils.GITHUB_TOKEN.get();

      if (token) {
        connect(token);

        const user = await User.fromGithub()
          .catch(() => null);
        setUser(user);
      }
    }

    prepare()
      .catch((err) => console.error(err))
      .finally(() => setIsReady(true));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isReady: isReady,
        isAuthenticated: !!user,
        user: user,

        login: async (token) => {
          connect(token);

          const user = await User.fromGithub()
            .catch(() => null);
          setUser(user);

          return AsyncStorageUtils.GITHUB_TOKEN.set(token);
        },

        logout: async () => {
          disconnect();
          setUser(null);

          return AsyncStorageUtils.GITHUB_TOKEN.remove();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);
