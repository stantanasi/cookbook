import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import Category from '../models/category.model';
import Cuisine from '../models/cuisine.model';
import Recipe from '../models/recipe.model';
import { useAppDispatch } from '../redux/store';

interface IAppContext {
  isReady: boolean;
  sync: () => Promise<void>;
}

export const AppContext = createContext<IAppContext>({
  isReady: false,
  sync: async () => { },
});

export default function AppProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isReady: isReady,

        sync: async () => {
          Promise.all([
            Category.fetch(dispatch),
            Cuisine.fetch(dispatch),
            Recipe.fetch(dispatch),
          ])
            .catch((err) => console.error(err))
            .finally(() => setIsReady(true));
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}


export const useApp = () => useContext(AppContext);
