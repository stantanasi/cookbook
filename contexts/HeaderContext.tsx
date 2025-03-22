import { createContext, PropsWithChildren, useState } from 'react'
import { HeaderFilterQuery } from '../components/organisms/Header'

interface IHeaderContext {
  query: string
  setQuery: (query: string) => void
  filter: HeaderFilterQuery
  setFilter: (filter: HeaderFilterQuery) => void
}

export const HeaderContext = createContext<IHeaderContext>({
  query: '',
  setQuery: () => { },
  filter: {},
  setFilter: () => { },
})

export default function HeaderProvider({ children }: PropsWithChildren) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HeaderFilterQuery>({})

  return (
    <HeaderContext.Provider
      value={{
        query: query,
        setQuery: setQuery,

        filter: filter,
        setFilter: setFilter,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}