import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { HeaderFilterQuery } from '../components/organisms/Header';

interface IHeaderContext {
  isSearchVisible: boolean;
  setIsSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  query: string;
  setQuery: (query: string) => void;
  filter: HeaderFilterQuery;
  setFilter: (filter: HeaderFilterQuery) => void;
}

export const HeaderContext = createContext<IHeaderContext>({
  isSearchVisible: false,
  setIsSearchVisible: () => { },
  query: '',
  setQuery: () => { },
  filter: {},
  setFilter: () => { },
});

export default function HeaderProvider({ children }: PropsWithChildren) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HeaderFilterQuery>({});

  return (
    <HeaderContext.Provider
      value={{
        isSearchVisible: isSearchVisible,
        setIsSearchVisible: setIsSearchVisible,

        query: query,
        setQuery: setQuery,

        filter: filter,
        setFilter: setFilter,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}


export const useHeader = () => useContext(HeaderContext);
