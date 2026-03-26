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
      const auth = await AsyncStorageUtils.AUTH.get();

      if (auth) {
        connect(auth.token);
        setUser(new User(auth.user));
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

          const user = await User.fromGithub();
          setUser(user);

          return AsyncStorageUtils.AUTH.set({
            token: token,
            user: user.toJSON(),
          });
        },

        logout: async () => {
          disconnect();
          setUser(null);

          return AsyncStorageUtils.AUTH.remove();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);
